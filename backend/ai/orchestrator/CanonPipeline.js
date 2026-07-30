// backend/ai/orchestrator/CanonPipeline.js

import logger from "../../utils/logger.js";

/**
 * CanonPipeline — AI Orchestrator for CanonSync.
 *
 * Coordinates the complete Canon Intelligence Pipeline in the following order:
 *
 *   Stage 1  Extract     — Extract structured facts from the scene via Granite.
 *   Stage 2  Embed       — Generate one embedding per extracted fact via IBM Slate.
 *   Stage 3  Retrieve    — Search for semantically similar pre-existing canon.
 *   Stage 4  Store       — Persist new facts + embeddings to canon_facts.
 *   Stage 5  Reason      — Run per-fact contradiction analysis via Granite.
 *   Stage 6  Persist     — Store confirmed conflicts to the conflicts table.
 *   Stage 7  Finalise    — Update submission status; return structured result.
 *
 * ── Stage ordering rationale (Stage 3 before Stage 4) ──────────────────────
 * Semantic retrieval (Stage 3) MUST run before canon storage (Stage 4).
 *
 * Reason: we are searching for existing canon that contradicts the newly
 * submitted scene.  If we persisted the new facts first, the similarity
 * search would return those same new facts as "matches" — contradicting
 * themselves — and the deduplication logic required to strip them would be
 * fragile (it would depend on successful storage of every fact).
 *
 * By retrieving first, the new facts do not exist in the database yet, so
 * every result from the search is guaranteed to be prior canon.  No
 * exclusion set is needed.
 *
 * ── Per-fact contradiction analysis ────────────────────────────────────────
 * ContradictionAnalysisService is called once per extracted fact, not once
 * for the entire scene.
 *
 * Reason: each fact is a single, focused claim (e.g. "John never_met Sarah").
 * Sending all facts to Granite simultaneously forces the model to reason about
 * N independent claims in one context window, which degrades accuracy and
 * produces a single verdict that cannot be attributed to a specific fact or
 * canon record.
 *
 * Per-fact analysis:
 *   - keeps each Granite context small and focused,
 *   - links every conflict to the exact canon record it contradicts,
 *   - allows conflicts to be persisted with the correct canon_id FK,
 *   - makes each stage independently testable.
 *
 * ── Dependency injection ────────────────────────────────────────────────────
 * All dependencies are injected via the constructor.  The orchestrator never
 * imports a provider, SDK, or repository directly — it only calls the
 * interfaces defined by its injected collaborators.  This keeps the pipeline
 * independently testable with mock collaborators.
 */
class CanonPipeline {
    /**
     * @param {Object} deps
     * @param {import('../services/FactExtractionService.js').default}        deps.factExtractionService
     * @param {import('../services/EmbeddingService.js').default}             deps.embeddingService
     * @param {import('../services/SemanticSearchService.js').default}        deps.semanticSearchService
     * @param {import('../services/ContradictionAnalysisService.js').default} deps.contradictionAnalysisService
     * @param {import('../services/ConflictPersistenceService.js').default}   deps.conflictPersistenceService
     * @param {import('../../repositories/canonRepository.js').default}       deps.canonRepository
     * @param {import('../../repositories/submissionRepository.js').default}  deps.submissionRepository
     */
    constructor({
        factExtractionService,
        embeddingService,
        semanticSearchService,
        contradictionAnalysisService,
        conflictPersistenceService,
        canonRepository,
        submissionRepository,
    }) {
        this.factExtractionService        = factExtractionService;
        this.embeddingService             = embeddingService;
        this.semanticSearchService        = semanticSearchService;
        this.contradictionAnalysisService = contradictionAnalysisService;
        this.conflictPersistenceService   = conflictPersistenceService;
        this.canonRepository              = canonRepository;
        this.submissionRepository         = submissionRepository;
    }

    /**
     * Execute the complete Canon Intelligence Pipeline for a submitted scene.
     *
     * Returns a structured result regardless of whether conflicts were found.
     * The result always contains facts, conflicts, warnings, and per-stage metrics.
     *
     * @param {Object} options
     * @param {string}  options.submissionId — UUID of the stored submission (status: pending).
     * @param {string}  options.script       — Raw screenplay scene text.
     * @param {string}  options.showId       — UUID of the show (used to scope canon searches).
     * @param {string}  [options.authorName] — Optional author name stored on new canon facts.
     * @returns {Promise<Object>}            — Structured pipeline result (see shape below).
     */
    async processSubmission({ submissionId, script, showId, authorName = null }) {
        const pipelineStart = Date.now();
        const metrics       = {};

        logger.info("CanonPipeline: starting pipeline", {
            submissionId,
            showId,
            scriptLength: script?.length ?? 0,
        });

        // ══════════════════════════════════════════════════════════════════════
        // Stage 1 — Fact Extraction
        // ══════════════════════════════════════════════════════════════════════
        logger.info("CanonPipeline [1/6]: fact extraction");

        const t1 = Date.now();
        let extractionResult;
        try {
            extractionResult = await this.factExtractionService.extractFacts(script);
        } catch (err) {
            return await this._fail(submissionId, "fact_extraction", err, metrics, pipelineStart);
        }
        metrics.extractionMs = Date.now() - t1;

        const { facts, warnings: extractionWarnings } = extractionResult;

        logger.info("CanonPipeline: extracted facts", {
            submissionId,
            factCount: facts.length,
            facts: facts.map((fact) => ({
                subject: fact.subject,
                relationship: fact.relationship,
                object: fact.object ?? null,
                confidence: fact.confidence,
            })),
        });

        // ── No facts extracted ───────────────────────────────────────────────
        // Handled here explicitly: mark as processed, return structured result,
        // skip all downstream stages (embedding, retrieval, reasoning, persistence).
        // This is a valid outcome — not every scene contains continuity facts.
        if (facts.length === 0) {
            logger.info(
                "CanonPipeline: no continuity facts extracted — " +
                "marking submission as processed with zero conflicts."
            );
            await this._updateStatus(submissionId, "processed");
            metrics.totalMs = Date.now() - pipelineStart;
            return {
                submissionId,
                status:   "processed",
                facts:    [],
                conflicts: [],
                analysis: null,
                warnings: extractionWarnings,
                message:  "No continuity-relevant facts found in the submitted scene.",
                metrics,
            };
        }

        // ══════════════════════════════════════════════════════════════════════
        // Stage 2 — Embedding Generation
        // ══════════════════════════════════════════════════════════════════════
        // One embedding is generated per extracted fact (see class-level design note).
        logger.info("CanonPipeline [2/6]: embedding generation", { factCount: facts.length });

        const t2 = Date.now();
        let embeddingResult;
        try {
            embeddingResult = await this.embeddingService.generateEmbeddings(facts);
        } catch (err) {
            // generateEmbeddings() only throws for a programming error (non-array input).
            // Individual embedding failures are returned as null vectors with warnings.
            return await this._fail(submissionId, "embedding_generation", err, metrics, pipelineStart);
        }
        metrics.embeddingMs = Date.now() - t2;

        const { vectors, warnings: embeddingWarnings } = embeddingResult;

        // Diagnostic logging: which facts failed embedding generation
        const nullVectorIndices = vectors
            .map((v, idx) => (v ? null : idx))
            .filter((i) => i !== null);
        logger.info("CanonPipeline: embedding diagnostic", {
            totalFacts: facts.length,
            embeddingsReturned: vectors.filter(Boolean).length,
            embeddingsNullIndices: nullVectorIndices,
        });

        // ══════════════════════════════════════════════════════════════════════
        // Stage 3 — Semantic Retrieval
        // ══════════════════════════════════════════════════════════════════════
        // MUST run before Stage 4 (canon storage).
        // See class-level "Stage ordering rationale" comment for full explanation.
        //
        // We search once per fact using that fact's own embedding. Each fact's
        // retrieved canon is compared independently in Stage 5.
        logger.info("CanonPipeline [3/6]: semantic retrieval");

        const t3 = Date.now();

        // retrievalByFact[i] holds the search results specific to facts[i].
        // This per-fact structure feeds directly into the per-fact contradiction
        // loop in Stage 5 — each fact is only compared against its own retrieved canon.
        const retrievalByFact   = new Array(facts.length).fill(null).map(() => []);
        const retrievalWarnings = [];
        const seenCanonIds     = new Set();

        for (let i = 0; i < facts.length; i++) {
            const vector = vectors[i];
            if (!vector) {
                // No embedding for this fact — cannot search; skip silently.
                continue;
            }

            try {
                const results = await this.semanticSearchService.searchSimilarFacts({
                    embedding: vector,
                    showId,
                });

                retrievalByFact[i].push(...results);
                results.forEach((result) => {
                    if (result?.canonFact?.canon_id) {
                        seenCanonIds.add(result.canonFact.canon_id);
                    }
                });

                if (results && results.length > 0) {
                    const topSim = results[0].similarity;
                    logger.info(`CanonPipeline: retrieval top similarity for fact[${i}]`, {
                        factIndex: i,
                        topSimilarity: topSim,
                        returned: results.length,
                        canonIds: results.map((r) => r.canonFact.canon_id),
                    });
                } else {
                    logger.info(`CanonPipeline: no retrieval results for fact[${i}]`, { factIndex: i });
                }
            } catch (err) {
                // Non-fatal: a retrieval failure for one fact does not block others.
                // The fact will still be stored in Stage 4; it just has no canon to
                // compare against in Stage 5 (contradiction analysis will return no-conflict).
                retrievalWarnings.push(`Retrieval failed for fact[${i}]: ${err.message}`);
                logger.error(`CanonPipeline: semantic retrieval error for fact[${i}]`, err);
            }
        }

        metrics.retrievalMs = Date.now() - t3;

        logger.info("CanonPipeline: semantic retrieval complete", {
            factsWithRetrieval: retrievalByFact.filter((list) => list.length > 0).length,
            totalFactCount: facts.length,
        });

        // ══════════════════════════════════════════════════════════════════════
        // Stage 4 — Canon Storage
        // ══════════════════════════════════════════════════════════════════════
        // New facts are stored AFTER retrieval (see class-level rationale comment).
        // Storing an embedding as a pgvector literal '[v1,v2,...]' is required by
        // the pg driver — raw JS arrays are not automatically cast by node-postgres.
        logger.info("CanonPipeline [4/6]: canon storage", { factCount: facts.length });

        const storedCanon     = [];
        const storageWarnings = [];

        for (let i = 0; i < facts.length; i++) {
            const fact   = facts[i];
            const vector = vectors[i];

            try {
                const canonFact = await this.canonRepository.createIfNotExists({
                    show_id:        showId,
                    category:       _inferCategory(fact.relationship),
                    fact_text:      _factToText(fact),
                    source_episode: null,
                    embedding:      vector,
                    superseded_by:  null,
                    author_name:    authorName,
                });
                storedCanon.push(canonFact);
            } catch (err) {
                storageWarnings.push(`Failed to store fact[${i}]: ${err.message}`);
                logger.error(`CanonPipeline: canon storage error for fact[${i}]`, err);
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // Stage 5 — Per-Fact Contradiction Analysis
        // ══════════════════════════════════════════════════════════════════════
        // Granite is called once per fact, using only the canon retrieved for
        // that specific fact in Stage 3.  See class-level design note for rationale.
        logger.info("CanonPipeline [5/6]: contradiction analysis", { factCount: facts.length });

        const t5 = Date.now();
        const conflictResults   = [];
        const reasoningWarnings = [];

        for (let i = 0; i < facts.length; i++) {
            const factRetrieved = retrievalByFact[i];

            // Skip reasoning for facts that had no retrieved canon — there is
            // nothing to contradict against.
            if (factRetrieved.length === 0) {
                logger.info(`CanonPipeline: skipping contradiction analysis for fact[${i}] due to no retrieved canon`, {
                    factIndex: i,
                    fact: {
                        subject: facts[i].subject,
                        relationship: facts[i].relationship,
                        object: facts[i].object ?? null,
                    },
                });
                continue;
            }

            logger.info(`CanonPipeline: analyzing fact[${i}] against retrieved canon`, {
                factIndex: i,
                fact: {
                    subject: facts[i].subject,
                    relationship: facts[i].relationship,
                    object: facts[i].object ?? null,
                    confidence: facts[i].confidence,
                },
                retrievedCanon: factRetrieved.map((r) => ({
                    canonId: r.canonFact.canon_id,
                    category: r.canonFact.category,
                    factText: r.canonFact.fact_text,
                    similarity: r.similarity,
                })),
            });

            try {
                const result = await this.contradictionAnalysisService.analyzeContradictions(
                    [facts[i]],
                    factRetrieved
                );

                if (result.hasConflict) {
                    // Attach the top-similarity canon record so Stage 6 can persist
                    // the conflict with the correct canon_id foreign key.
                    conflictResults.push({
                        conflictResult: result,
                        canonId:        factRetrieved[0].canonFact.canon_id,
                        factIndex:      i,
                    });
                    logger.info(`CanonPipeline: fact[${i}] detected conflict`, {
                        factIndex: i,
                        conflictResult: {
                            hasConflict: result.hasConflict,
                            severity: result.severity,
                            category: result.category,
                            confidence: result.confidence,
                        },
                    });
                } else {
                    logger.info(`CanonPipeline: fact[${i}] did not detect a conflict`, {
                        factIndex: i,
                        severity: result.severity,
                        confidence: result.confidence,
                    });
                }
            } catch (err) {
                // Non-fatal: log and continue with remaining facts.
                reasoningWarnings.push(`Contradiction analysis failed for fact[${i}]: ${err.message}`);
                logger.error(`CanonPipeline: contradiction analysis error for fact[${i}]`, err);
            }
        }

        metrics.reasoningMs = Date.now() - t5;

        logger.info("CanonPipeline: contradiction analysis complete", {
            factsAnalyzed:    facts.filter((_, i) => retrievalByFact[i].length > 0).length,
            conflictsFound:   conflictResults.length,
        });

        // ══════════════════════════════════════════════════════════════════════
        // Stage 6 — Conflict Persistence
        // ══════════════════════════════════════════════════════════════════════
        logger.info("CanonPipeline [6/6]: conflict persistence", {
            conflictsToStore: conflictResults.length,
        });

        const t6 = Date.now();
        const persistedConflicts  = [];
        const persistenceWarnings = [];

        for (const { conflictResult, canonId } of conflictResults) {
            try {
                const { persisted, warnings: pw } =
                    await this.conflictPersistenceService.persistConflicts([
                        { submissionId, canonId, conflictResult },
                    ]);
                persistedConflicts.push(...persisted);
                persistenceWarnings.push(...pw);
            } catch (err) {
                persistenceWarnings.push(
                    `Persistence error for canonId ${canonId}: ${err.message}`
                );
                logger.error("CanonPipeline: conflict persistence error", err);
            }
        }

        metrics.persistenceMs = Date.now() - t6;

        // ══════════════════════════════════════════════════════════════════════
        // Stage 7 — Finalise
        // ══════════════════════════════════════════════════════════════════════
        await this._updateStatus(submissionId, "processed");

        metrics.totalMs = Date.now() - pipelineStart;

        logger.info("CanonPipeline: pipeline complete", {
            submissionId,
            factsExtracted:    facts.length,
            canonStored:       storedCanon.length,
            canonRetrieved:    seenCanonIds.size,
            conflictsDetected: persistedConflicts.length,
            metrics,
        });

        // ── Build the top-level analysis summary ──────────────────────────────
        // Summarise all conflict results: if any had a conflict, report the
        // highest-severity one in the top-level analysis field.
        const topConflict = _selectTopConflict(conflictResults);

        return {
            submissionId,
            status:    "processed",
            facts:     facts.map(_factToPublic),
            conflicts: persistedConflicts.map(_conflictToPublic),
            analysis:  topConflict
                ? {
                    hasConflict:        topConflict.conflictResult.hasConflict,
                    severity:           topConflict.conflictResult.severity,
                    category:           topConflict.conflictResult.category,
                    message:            topConflict.conflictResult.message,
                    supportingEvidence: topConflict.conflictResult.supportingEvidence,
                    confidence:         topConflict.conflictResult.confidence,
                }
                : {
                    hasConflict:        false,
                    severity:           "Low",
                    category:           "None",
                    message:            "No continuity conflicts detected.",
                    supportingEvidence: [],
                    confidence:         0.99,
                },
            warnings: [
                ...extractionWarnings,
                ...embeddingWarnings,
                ...retrievalWarnings,
                ...storageWarnings,
                ...reasoningWarnings,
                ...persistenceWarnings,
            ],
            metrics,
        };
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * Update the submission's processing status in the database.
     *
     * Errors are logged but not re-thrown: a status-update failure must not
     * suppress a pipeline result that has already been computed.
     *
     * @param {string} submissionId
     * @param {'processed'|'failed'} status
     * @private
     */
    async _updateStatus(submissionId, status) {
        try {
            await this.submissionRepository.update(submissionId, { status });
        } catch (err) {
            logger.error(
                `CanonPipeline: failed to update submission ${submissionId} status to "${status}"`,
                err
            );
        }
    }

    /**
     * Mark the submission as failed and return a structured failure response.
     * Always called with the accumulated metrics so latency data is preserved.
     *
     * @param {string} submissionId
     * @param {string} stage         — Machine-readable stage identifier for observability.
     * @param {Error}  err
     * @param {Object} metrics       — Partial metrics accumulated so far.
     * @param {number} pipelineStart — Pipeline start timestamp (ms).
     * @returns {Promise<Object>}
     * @private
     */
    async _fail(submissionId, stage, err, metrics, pipelineStart) {
        logger.error(`CanonPipeline: pipeline failed at stage "${stage}"`, err);
        metrics.totalMs = Date.now() - pipelineStart;
        await this._updateStatus(submissionId, "failed");
        return {
            submissionId,
            status:   "failed",
            stage,
            error:    err.message,
            facts:     [],
            conflicts: [],
            analysis:  null,
            warnings:  [],
            metrics,
        };
    }
}

// ── Module-level pure helpers ──────────────────────────────────────────────────

/**
 * Convert a structured fact to a compact, human-readable text string.
 * Used as the fact_text value stored in canon_facts.
 *
 * @param {Object} fact
 * @returns {string}
 */
function _factToText(fact) {
    const obj = fact.object ? ` ${fact.object}` : "";
    return `${fact.subject} ${fact.relationship}${obj}`.trim();
}

/**
 * Infer the best-fit CANON_CATEGORIES value from a relationship string.
 *
 * The category list is defined in backend/utils/schemas.js:
 *   "character" | "lore" | "timeline" | "location" | "relationship" |
 *   "event" | "world_rule" | "other"
 *
 * The mapping is intentionally conservative: when no regex matches, the
 * fallback is "other" which is always a valid category value.
 *
 * @param {string} relationship
 * @returns {string}
 */
function _inferCategory(relationship) {
    if (!relationship) return "other";
    const r = relationship.toLowerCase();

    if (/married|sibling|parent|child|friend|enemy|never_met|\bmet\b/.test(r)) return "relationship";
    if (/alive|dead|injured|missing|imprisoned/.test(r))                        return "character";
    if (/located|travel|departed/.test(r))                                      return "location";
    if (/before|after|during/.test(r))                                          return "timeline";
    if (/killed|rescued|betrayed|promoted|resigned|crowned|arrested|born/.test(r)) return "event";
    if (/law|rule|magic|power|ability|govern|forbid/.test(r))                   return "world_rule";
    if (/owns|possesses|lost|discovered|destroyed/.test(r))                     return "lore";
    return "other";
}

/**
 * Select the most significant conflict from the per-fact results array.
 * "Most significant" is defined as the highest severity, with confidence
 * used as a tiebreaker.
 *
 * Returns null if conflictResults is empty.
 *
 * @param {Array<{ conflictResult: Object, canonId: string, factIndex: number }>} conflictResults
 * @returns {{ conflictResult: Object, canonId: string, factIndex: number } | null}
 */
function _selectTopConflict(conflictResults) {
    if (conflictResults.length === 0) return null;
    if (conflictResults.length === 1) return conflictResults[0];

    const SEVERITY_RANK = { Critical: 4, High: 3, Medium: 2, Low: 1 };

    return conflictResults.reduce((top, current) => {
        const topRank  = SEVERITY_RANK[top.conflictResult.severity]     ?? 0;
        const currRank = SEVERITY_RANK[current.conflictResult.severity] ?? 0;
        if (currRank > topRank) return current;
        if (currRank === topRank && current.conflictResult.confidence > top.conflictResult.confidence) {
            return current;
        }
        return top;
    });
}

/**
 * Shape a raw fact object for the public API response.
 *
 * @param {Object} fact
 * @returns {Object}
 */
function _factToPublic(fact) {
    return {
        subject:      fact.subject,
        relationship: fact.relationship,
        object:       fact.object ?? null,
        confidence:   fact.confidence,
    };
}

/**
 * Shape a persisted Conflict model for the public API response.
 *
 * @param {import('../../models/Conflict.js').default} conflict
 * @returns {Object}
 */
function _conflictToPublic(conflict) {
    return {
        conflict_id:   conflict.conflict_id,
        submission_id: conflict.submission_id,
        canon_id:      conflict.canon_id,
        confidence:    conflict.confidence,
        reasoning:     conflict.reasoning,
        status:        conflict.status,
        created_at:    conflict.created_at,
    };
}

export default CanonPipeline;
