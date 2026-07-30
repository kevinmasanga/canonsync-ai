// backend/ai/orchestrator/CanonPipeline.js

import logger from "../../utils/logger.js";

/**
 * CanonPipeline — AI Orchestrator for CanonSync.
 *
 * Coordinates the complete AI processing pipeline in the correct order:
 *
 *   1. Fact Extraction     — Extract structured canon facts from the scene.
 *   2. Embedding           — Generate vectors for each extracted fact.
 *   3. Canon Storage       — Persist each fact + embedding to the canon table.
 *   4. Semantic Search     — Retrieve the most relevant pre-existing canon facts.
 *   5. Contradiction Analysis — Reason over new facts vs retrieved canon.
 *   6. Conflict Persistence   — Store any detected conflicts.
 *   7. Report              — Return a structured response.
 *
 * The orchestrator manages execution order and error handling.
 * It does not perform AI reasoning, storage, or embedding itself.
 *
 * Dependencies are injected via the constructor to keep the class testable
 * and decoupled from SDK implementation details.
 */
class CanonPipeline {
    /**
     * @param {Object} deps
     * @param {import('../services/FactExtractionService.js').default}       deps.factExtractionService
     * @param {import('../services/EmbeddingService.js').default}            deps.embeddingService
     * @param {import('../services/SemanticSearchService.js').default}       deps.semanticSearchService
     * @param {import('../services/ContradictionAnalysisService.js').default} deps.contradictionAnalysisService
     * @param {import('../services/ConflictPersistenceService.js').default}  deps.conflictPersistenceService
     * @param {import('../../repositories/canonRepository.js').default}      deps.canonRepository
     * @param {import('../../repositories/submissionRepository.js').default} deps.submissionRepository
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
        this.factExtractionService       = factExtractionService;
        this.embeddingService            = embeddingService;
        this.semanticSearchService       = semanticSearchService;
        this.contradictionAnalysisService = contradictionAnalysisService;
        this.conflictPersistenceService  = conflictPersistenceService;
        this.canonRepository             = canonRepository;
        this.submissionRepository        = submissionRepository;
    }

    /**
     * Execute the complete AI pipeline for a submitted scene.
     *
     * @param {Object} options
     * @param {string}  options.submissionId — UUID of the stored submission.
     * @param {string}  options.script       — Raw screenplay scene text.
     * @param {string}  options.showId       — UUID of the show for scoping.
     * @param {string}  [options.authorName] — Optional author name for new canon facts.
     * @returns {Promise<Object>}            — Structured pipeline result (see return below).
     */
    async processSubmission({ submissionId, script, showId, authorName = null }) {
        const startTime = Date.now();

        logger.info("CanonPipeline: starting pipeline", {
            submissionId,
            showId,
            scriptLength: script?.length ?? 0,
        });

        // ── Stage 1: Fact Extraction ───────────────────────────────────────────
        logger.info("CanonPipeline [1/6]: fact extraction");
        let extractionResult;
        try {
            extractionResult = await this.factExtractionService.extractFacts(script);
        } catch (err) {
            return await this._fail(submissionId, "Fact extraction failed", err);
        }

        const { facts, warnings: extractionWarnings } = extractionResult;

        if (facts.length === 0) {
            logger.info("CanonPipeline: no facts extracted — marking as processed with no conflicts.");
            await this._updateStatus(submissionId, "processed");
            return {
                submissionId,
                status:    "processed",
                facts:     [],
                conflicts: [],
                message:   "No continuity-relevant facts found in the submitted scene.",
                warnings:  extractionWarnings,
                latencyMs: Date.now() - startTime,
            };
        }

        // ── Stage 2: Embedding Generation ─────────────────────────────────────
        logger.info("CanonPipeline [2/6]: embedding generation", { factCount: facts.length });
        let embeddingResult;
        try {
            embeddingResult = await this.embeddingService.generateEmbeddings(facts);
        } catch (err) {
            return await this._fail(submissionId, "Embedding generation failed", err);
        }

        const { vectors, warnings: embeddingWarnings } = embeddingResult;

        // ── Stage 3: Canon Storage ─────────────────────────────────────────────
        // Persist each fact + its embedding to the canon_facts table so future
        // submissions can search against them.
        logger.info("CanonPipeline [3/6]: storing new canon facts");
        const storedCanon = [];
        const storageWarnings = [];

        for (let i = 0; i < facts.length; i++) {
            const fact   = facts[i];
            const vector = vectors[i];

            try {
                const canonFact = await this.canonRepository.create({
                    show_id:        showId,
                    category:       _inferCategory(fact.relationship),
                    fact_text:      _factToText(fact),
                    source_episode: null,
                    embedding:      vector ? `[${vector.join(",")}]` : null,
                    superseded_by:  null,
                    author_name:    authorName,
                });
                storedCanon.push(canonFact);
            } catch (err) {
                storageWarnings.push(`Failed to store fact[${i}]: ${err.message}`);
                logger.error("CanonPipeline: canon storage error", err);
            }
        }

        // ── Stage 4: Semantic Search ───────────────────────────────────────────
        // For each fact that has a valid embedding, search for similar pre-existing canon.
        // Deduplicate results across all fact queries.
        logger.info("CanonPipeline [4/6]: semantic search");
        const allRetrieved = [];
        const seenCanonIds = new Set();

        for (let i = 0; i < facts.length; i++) {
            const vector = vectors[i];
            if (!vector) continue;

            try {
                const results = await this.semanticSearchService.searchSimilarFacts({
                    embedding: vector,
                    showId,
                });

                for (const r of results) {
                    // Exclude facts we just stored in Stage 3 (they are from this submission)
                    const isNew = storedCanon.some((cf) => cf.canon_id === r.canonFact.canon_id);
                    if (!isNew && !seenCanonIds.has(r.canonFact.canon_id)) {
                        seenCanonIds.add(r.canonFact.canon_id);
                        allRetrieved.push(r);
                    }
                }
            } catch (err) {
                logger.error("CanonPipeline: semantic search error for fact " + i, err);
                // Non-fatal: continue with whatever we've retrieved so far
            }
        }

        logger.info("CanonPipeline: semantic search complete", {
            uniqueCanonRetrieved: allRetrieved.length,
        });

        // ── Stage 5: Contradiction Analysis ───────────────────────────────────
        logger.info("CanonPipeline [5/6]: contradiction analysis");
        let conflictResult;
        try {
            conflictResult = await this.contradictionAnalysisService.analyzeContradictions(
                facts,
                allRetrieved
            );
        } catch (err) {
            return await this._fail(submissionId, "Contradiction analysis failed", err);
        }

        // ── Stage 6: Conflict Persistence ─────────────────────────────────────
        logger.info("CanonPipeline [6/6]: conflict persistence");
        const persistedConflicts = [];
        const persistenceWarnings = [];

        if (conflictResult.hasConflict && allRetrieved.length > 0) {
            // Associate the conflict with the highest-similarity canon fact
            const topCanon = allRetrieved[0];

            try {
                const { persisted, warnings: pw } = await this.conflictPersistenceService.persistConflicts([
                    {
                        submissionId,
                        canonId:       topCanon.canonFact.canon_id,
                        conflictResult,
                    },
                ]);
                persistedConflicts.push(...persisted);
                persistenceWarnings.push(...pw);
            } catch (err) {
                logger.error("CanonPipeline: conflict persistence error", err);
                persistenceWarnings.push(`Conflict persistence error: ${err.message}`);
            }
        }

        // ── Mark submission as processed ──────────────────────────────────────
        await this._updateStatus(submissionId, "processed");

        const latencyMs = Date.now() - startTime;

        logger.info("CanonPipeline: pipeline complete", {
            submissionId,
            factsExtracted:     facts.length,
            canonStored:        storedCanon.length,
            canonRetrieved:     allRetrieved.length,
            conflictsDetected:  persistedConflicts.length,
            latencyMs,
        });

        // ── Return structured result ───────────────────────────────────────────
        return {
            submissionId,
            status:    "processed",
            facts:     facts.map(_factToPublic),
            conflicts: persistedConflicts.map(_conflictToPublic),
            analysis:  {
                hasConflict:        conflictResult.hasConflict,
                severity:           conflictResult.severity,
                category:           conflictResult.category,
                message:            conflictResult.message,
                supportingEvidence: conflictResult.supportingEvidence,
                confidence:         conflictResult.confidence,
            },
            warnings: [
                ...extractionWarnings,
                ...embeddingWarnings,
                ...storageWarnings,
                ...persistenceWarnings,
            ],
            latencyMs,
        };
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * Update submission status in the database.
     *
     * @param {string} submissionId
     * @param {'processed'|'failed'} status
     * @private
     */
    async _updateStatus(submissionId, status) {
        try {
            await this.submissionRepository.update(submissionId, { status });
        } catch (err) {
            // Log but do not re-throw — status update failure should not
            // suppress the pipeline result that has already been computed.
            logger.error(`CanonPipeline: failed to update submission status to ${status}`, err);
        }
    }

    /**
     * Mark submission as failed, log the error, and return a structured failure response.
     *
     * @param {string} submissionId
     * @param {string} stage
     * @param {Error}  err
     * @returns {Promise<Object>}
     * @private
     */
    async _fail(submissionId, stage, err) {
        logger.error(`CanonPipeline: pipeline failed at stage "${stage}"`, err);
        await this._updateStatus(submissionId, "failed");
        return {
            submissionId,
            status:  "failed",
            stage,
            error:   err.message,
            facts:     [],
            conflicts: [],
        };
    }
}

// ── Module-level helpers ───────────────────────────────────────────────────────

/**
 * Convert a fact object to a compact text string for storage.
 *
 * @param {Object} fact
 * @returns {string}
 */
function _factToText(fact) {
    const obj = fact.object ? ` ${fact.object}` : "";
    return `${fact.subject} ${fact.relationship}${obj}`.trim();
}

/**
 * Infer a canon category from the relationship string.
 * Maps to the CANON_CATEGORIES enum in utils/schemas.js.
 *
 * @param {string} relationship
 * @returns {string}
 */
function _inferCategory(relationship) {
    if (!relationship) return "other";
    const r = relationship.toLowerCase();

    if (/married|sibling|parent|child|friend|enemy|never_met|met/.test(r)) return "relationship";
    if (/alive|dead|injured|missing|imprisoned/.test(r))                    return "character";
    if (/located|travel|departed/.test(r))                                  return "location";
    if (/before|after|during/.test(r))                                      return "timeline";
    if (/owns|possesses|lost|discovered|destroyed/.test(r))                 return "lore";
    return "other";
}

/**
 * Shape a fact for the public API response.
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
 * Shape a conflict record for the public API response.
 *
 * @param {Object} conflict
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
