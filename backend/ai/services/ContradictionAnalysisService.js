// backend/ai/services/ContradictionAnalysisService.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseJSON } from "../utils/parseJSON.js";
import { validateConflict } from "../schemas/conflictSchema.js";
import logger from "../../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROMPT_PATH = path.resolve(
    __dirname,
    "../prompts/contradictionAnalysis.prompt.txt"
);

/**
 * Analyzes a single extracted fact against retrieved canon to detect
 * continuity contradictions.
 *
 * Responsibilities:
 *   - Load the contradiction analysis prompt template from disk (cached after first load).
 *   - Inject one extracted fact and its retrieved canon context into the template.
 *   - Send the prompt to the LLM provider.
 *   - Parse the JSON response safely.
 *   - Retry the LLM call once if the first response cannot be parsed.
 *   - Validate the result against the CanonSync Conflict Schema.
 *   - Return a validated conflict result object.
 *
 * This service performs reasoning only.
 * It does not retrieve canon data, persist conflicts, or generate embeddings.
 *
 * Caller contract
 * ---------------
 * The caller (CanonPipeline) invokes this service once per extracted fact,
 * passing that fact and only the canon retrieved for that fact's embedding.
 * This keeps each analysis context focused and avoids cross-contamination
 * between unrelated facts from the same scene.
 */
class ContradictionAnalysisService {
    /**
     * @param {import('../providers/LLMProvider.js').default} provider
     */
    constructor(provider) {
        this.provider = provider;
        this._promptTemplate = null;
    }

    /**
     * Lazy-load and cache the prompt template from disk.
     *
     * @returns {string}
     * @private
     */
    _loadPromptTemplate() {
        if (!this._promptTemplate) {
            try {
                this._promptTemplate = fs.readFileSync(PROMPT_PATH, "utf-8");
            } catch (err) {
                throw new Error(
                    `ContradictionAnalysisService: could not load prompt template ` +
                    `from ${PROMPT_PATH}: ${err.message}`
                );
            }
        }
        return this._promptTemplate;
    }

    /**
     * Build the full prompt by injecting facts into the template.
     *
     * @param {Object[]} newFacts    — Newly extracted facts (one element when called per-fact).
     * @param {Object[]} canonFacts  — Retrieved canon fact summaries (plain objects).
     * @returns {string}
     * @private
     */
    _buildPrompt(newFacts, canonFacts) {
        return this._loadPromptTemplate()
            .replace("{{newFacts}}",   JSON.stringify(newFacts,   null, 2))
            .replace("{{canonFacts}}", JSON.stringify(canonFacts, null, 2));
    }

    /**
     * Call the LLM provider and attempt to parse the response as a conflict object.
     * Retries once if the first response cannot be parsed.
     *
     * Retry rationale: matches the pattern in FactExtractionService — Granite
     * occasionally emits a preamble before the JSON object on the first attempt.
     * A single retry recovers from this without masking genuine failures.
     *
     * @param {string} prompt
     * @param {number} attempt  — 1 (first call) or 2 (retry)
     * @returns {Promise<{ raw: string, parsed: * }>}
     * @throws {Error} — After two failed parse attempts.
     * @private
     */
    async _callAndParse(prompt, attempt = 1) {
        let raw;
        try {
            raw = await this.provider.generateContent({ prompt, temperature: 0.1 });
        } catch (err) {
            throw new Error(
                `ContradictionAnalysisService: LLM call failed (attempt ${attempt}) — ${err.message}`
            );
        }

        if (!raw || raw.trim().length === 0) {
            return { raw: "", parsed: null };
        }

        try {
            const parsed = parseJSON(raw);
            return { raw, parsed };
        } catch (parseErr) {
            if (attempt === 1) {
                logger.info(
                    "ContradictionAnalysisService: JSON parse failed on attempt 1 — retrying",
                    {
                        parseError: parseErr.message,
                        rawPreview: raw.slice(0, 120),
                    }
                );
                return this._callAndParse(prompt, 2);
            }
            throw new Error(
                `ContradictionAnalysisService: could not parse LLM response after 2 attempts — ` +
                `${parseErr.message}`
            );
        }
    }

    /**
     * Analyze one extracted fact against retrieved canon for contradictions.
     *
     * @param {Object[]} newFacts       — Facts to analyze (one element in per-fact mode).
     * @param {Object[]} retrievedFacts — Top-K canon results for this fact's embedding.
     *                                    Each element: { canonFact: CanonFact, similarity: number }
     * @returns {Promise<Object>}       — Validated conflict result (CanonSync Conflict Schema).
     * @throws {Error}                  — If the provider fails or both parse attempts fail.
     */
    async analyzeContradictions(newFacts, retrievedFacts) {
        if (!Array.isArray(newFacts)) {
            throw new Error("ContradictionAnalysisService: newFacts must be an array.");
        }

        // Nothing to reason about — return no-conflict immediately without an LLM call
        if (newFacts.length === 0) {
            logger.info("ContradictionAnalysisService: no new facts — skipping analysis.");
            return _noConflictResult("No new facts were extracted from the scene.");
        }

        // If no relevant canon was retrieved, there is nothing to contradict
        if (!retrievedFacts || retrievedFacts.length === 0) {
            logger.info("ContradictionAnalysisService: no retrieved canon — skipping analysis.");
            return _noConflictResult("No existing canon was found for comparison.");
        }

        // Distill retrieved entries to just the fields the prompt needs
        const canonFactObjects = retrievedFacts.map(({ canonFact }) => ({
            canon_id:       canonFact.canon_id,
            fact_text:      canonFact.fact_text,
            category:       canonFact.category,
            source_episode: canonFact.source_episode,
        }));

        logger.info("ContradictionAnalysisService: starting contradiction analysis", {
            newFactCount:   newFacts.length,
            canonFactCount: canonFactObjects.length,
            provider:       this.provider.getMetadata().provider,
        });

        const prompt = this._buildPrompt(newFacts, canonFactObjects);
        const { raw, parsed } = await this._callAndParse(prompt);

        // Empty LLM response — treat as no conflict rather than hard-failing
        if (!raw || raw.trim().length === 0) {
            logger.info(
                "ContradictionAnalysisService: LLM returned empty response — treating as no conflict."
            );
            return _noConflictResult("LLM returned an empty response.");
        }

        const { valid, errors } = validateConflict(parsed);
        if (!valid) {
            throw new Error(
                `ContradictionAnalysisService: LLM response failed schema validation — ` +
                `${errors.join("; ")}`
            );
        }

        logger.info("ContradictionAnalysisService: analysis complete", {
            hasConflict: parsed.hasConflict,
            severity:    parsed.severity,
            confidence:  parsed.confidence,
        });

        return parsed;
    }
}

/**
 * Canonical "no conflict" result.
 *
 * @param {string} [message]
 * @returns {Object}
 */
function _noConflictResult(message = "No continuity conflicts detected.") {
    return {
        hasConflict:        false,
        severity:           "Low",
        category:           "None",
        message,
        supportingEvidence: [],
        confidence:         0.99,
    };
}

export default ContradictionAnalysisService;
