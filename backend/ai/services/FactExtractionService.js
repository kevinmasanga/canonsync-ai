// backend/ai/services/FactExtractionService.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseJSON } from "../utils/parseJSON.js";
import { validateFacts } from "../schemas/factSchema.js";
import logger from "../../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROMPT_PATH = path.resolve(
    __dirname,
    "../prompts/factExtraction.prompt.txt"
);

/**
 * Extracts structured continuity facts from a screenplay scene.
 *
 * Responsibilities:
 *   - Load the fact extraction prompt template from disk (cached after first load).
 *   - Inject the scene into the template.
 *   - Send the prompt to the LLM provider.
 *   - Parse the JSON response safely (strips markdown fences, locates JSON boundaries).
 *   - Retry the LLM call once if the response cannot be parsed as valid JSON.
 *   - Validate every extracted fact against the CanonSync Fact Schema.
 *   - Discard invalid facts with warnings rather than failing the entire extraction.
 *   - Return only valid, schema-conforming facts.
 *
 * This service performs extraction only.
 * It does not generate embeddings, search canon, or detect contradictions.
 */
class FactExtractionService {
    /**
     * @param {import('../providers/LLMProvider.js').default} provider
     */
    constructor(provider) {
        this.provider = provider;
        this._promptTemplate = null;
    }

    /**
     * Lazy-load and cache the prompt template from disk.
     * Reading once and caching avoids repeated I/O on every submission.
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
                    `FactExtractionService: could not load prompt template from ${PROMPT_PATH}: ${err.message}`
                );
            }
        }
        return this._promptTemplate;
    }

    /**
     * Build the full prompt by injecting the scene into the template.
     *
     * @param {string} scene
     * @returns {string}
     * @private
     */
    _buildPrompt(scene) {
        return this._loadPromptTemplate().replace("{{scene}}", scene);
    }

    /**
     * Call the LLM provider and attempt to parse the response as JSON.
     * Retries once if the first response cannot be parsed.
     *
     * Retry rationale: LLMs occasionally emit a preamble sentence before the
     * JSON array on the first attempt (e.g. "Here are the facts:"), then
     * respond cleanly when prompted a second time.  A single retry recovers
     * from this without masking genuine model failures.
     *
     * @param {string} prompt
     * @param {number} attempt   — 1 (first call) or 2 (retry)
     * @returns {Promise<{ raw: string, parsed: * }>}
     * @throws {Error} — After two failed parse attempts.
     * @private
     */
    async _callAndParse(prompt, attempt = 1) {
        let raw;
        try {
            raw = await this.provider.generateContent({ prompt, temperature: 0.1 });
        } catch (err) {
            throw new Error(`FactExtractionService: LLM call failed (attempt ${attempt}) — ${err.message}`);
        }

        if (!raw || raw.trim().length === 0) {
            return { raw: "", parsed: [] };
        }

        try {
            const parsed = parseJSON(raw);
            return { raw, parsed };
        } catch (parseErr) {
            if (attempt === 1) {
                logger.info("FactExtractionService: JSON parse failed on attempt 1 — retrying", {
                    parseError: parseErr.message,
                    rawPreview: raw.slice(0, 120),
                });
                return this._callAndParse(prompt, 2);
            }
            // Both attempts failed — surface the error with the raw response for debugging
            throw new Error(
                `FactExtractionService: could not parse LLM response after 2 attempts — ` +
                `${parseErr.message}`
            );
        }
    }

    /**
     * Extract structured canon facts from a screenplay scene.
     *
     * @param {string} scene   — Raw screenplay scene text.
     * @returns {Promise<{ facts: Object[], warnings: string[] }>}
     *   facts    — Array of valid facts conforming to the CanonSync Fact Schema.
     *   warnings — Validation warnings for any discarded facts, or parse retry notices.
     * @throws {Error}         — If the provider fails or both parse attempts fail.
     */
    async extractFacts(scene) {
        if (!scene || typeof scene !== "string" || scene.trim().length === 0) {
            throw new Error("FactExtractionService.extractFacts: scene must be a non-empty string.");
        }

        logger.info("FactExtractionService: starting fact extraction", {
            sceneLength: scene.length,
            provider:    this.provider.getMetadata().provider,
        });

        const prompt = this._buildPrompt(scene);
        const { raw, parsed } = await this._callAndParse(prompt);

        if (!raw || raw.trim().length === 0) {
            logger.info("FactExtractionService: LLM returned empty response — treating as no facts.");
            return { facts: [], warnings: ["LLM returned an empty response."] };
        }

        const { facts, warnings } = validateFacts(parsed);

        if (warnings.length > 0) {
            logger.info("FactExtractionService: schema validation warnings", { warnings });
        }

        logger.info("FactExtractionService: extraction complete", {
            totalExtracted: Array.isArray(parsed) ? parsed.length : "N/A",
            validFacts:     facts.length,
            warnings:       warnings.length,
        });

        return { facts, warnings };
    }
}

export default FactExtractionService;
