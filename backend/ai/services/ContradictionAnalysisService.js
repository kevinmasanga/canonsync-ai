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
 * Analyzes newly extracted canon facts against retrieved canon
 * to detect continuity contradictions.
 *
 * Responsibilities:
 *   - Load the contradiction analysis prompt template.
 *   - Inject new facts and retrieved canon into the template.
 *   - Send the prompt to the LLM provider.
 *   - Parse and validate the JSON response against the CanonSync Conflict Schema.
 *   - Return a structured conflict analysis result.
 *
 * This service performs reasoning only.
 * It does not retrieve canon data, persist conflicts, or generate reports.
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
                    `ContradictionAnalysisService: could not load prompt template from ${PROMPT_PATH}: ${err.message}`
                );
            }
        }
        return this._promptTemplate;
    }

    /**
     * Build the full prompt by injecting facts into the template.
     *
     * @param {Object[]} newFacts      — Newly extracted facts.
     * @param {Object[]} canonFacts    — Retrieved canon facts (plain objects, not CanonFact models).
     * @returns {string}
     * @private
     */
    _buildPrompt(newFacts, canonFacts) {
        return this._loadPromptTemplate()
            .replace("{{newFacts}}", JSON.stringify(newFacts, null, 2))
            .replace("{{canonFacts}}", JSON.stringify(canonFacts, null, 2));
    }

    /**
     * Analyze extracted facts against retrieved canon for contradictions.
     *
     * @param {Object[]} newFacts       — Facts extracted from the submitted scene.
     * @param {Object[]} retrievedFacts — Top-K canon facts from semantic search
     *                                    (each is { canonFact, similarity }).
     * @returns {Promise<Object>}       — Validated conflict result conforming to the Conflict Schema.
     * @throws {Error}                  — If the provider fails or returns an invalid response.
     */
    async analyzeContradictions(newFacts, retrievedFacts) {
        if (!Array.isArray(newFacts)) {
            throw new Error("ContradictionAnalysisService: newFacts must be an array.");
        }

        // If there is nothing to reason about on either side, return no-conflict immediately
        if (newFacts.length === 0) {
            logger.info("ContradictionAnalysisService: no new facts — skipping analysis.");
            return _noConflictResult("No new facts were extracted from the scene.");
        }

        // Extract just the canon fact data for the prompt (drop similarity scores)
        const canonFactObjects = (retrievedFacts || []).map((r) => {
            const cf = r.canonFact;
            return {
                canon_id:       cf.canon_id,
                fact_text:      cf.fact_text,
                category:       cf.category,
                source_episode: cf.source_episode,
            };
        });

        logger.info("ContradictionAnalysisService: starting contradiction analysis", {
            newFactCount:   newFacts.length,
            canonFactCount: canonFactObjects.length,
            provider:       this.provider.getMetadata().provider,
        });

        const prompt = this._buildPrompt(newFacts, canonFactObjects);

        let raw;
        try {
            raw = await this.provider.generateContent({ prompt, temperature: 0.1 });
        } catch (err) {
            throw new Error(`ContradictionAnalysisService: LLM call failed — ${err.message}`);
        }

        if (!raw || raw.trim().length === 0) {
            logger.info("ContradictionAnalysisService: LLM returned empty response, treating as no conflict.");
            return _noConflictResult("LLM returned an empty response.");
        }

        let parsed;
        try {
            parsed = parseJSON(raw);
        } catch (err) {
            throw new Error(`ContradictionAnalysisService: could not parse LLM response — ${err.message}`);
        }

        const { valid, errors } = validateConflict(parsed);
        if (!valid) {
            throw new Error(
                `ContradictionAnalysisService: LLM response failed schema validation — ${errors.join("; ")}`
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
 * Build a canonical "no conflict" result object.
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
