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
 *   - Load the fact extraction prompt template.
 *   - Inject the scene into the template.
 *   - Send the prompt to the LLM provider.
 *   - Parse and validate the JSON response against the CanonSync Fact Schema.
 *   - Return only valid, conforming facts.
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
     * Extract structured canon facts from a screenplay scene.
     *
     * @param {string} scene   — Raw screenplay scene text.
     * @returns {Promise<{ facts: Object[], warnings: string[] }>}
     *   facts    — Array of valid facts conforming to the CanonSync Fact Schema.
     *   warnings — Validation warnings for any discarded facts.
     * @throws {Error}         — If the provider fails or returns unparseable output.
     */
    async extractFacts(scene) {
        if (!scene || typeof scene !== "string" || scene.trim().length === 0) {
            throw new Error("FactExtractionService.extractFacts: scene must be a non-empty string.");
        }

        logger.info("FactExtractionService: starting fact extraction", {
            sceneLength: scene.length,
            provider: this.provider.getMetadata().provider,
        });

        const prompt = this._buildPrompt(scene);

        let raw;
        try {
            raw = await this.provider.generateContent({ prompt, temperature: 0.1 });
        } catch (err) {
            throw new Error(`FactExtractionService: LLM call failed — ${err.message}`);
        }

        // Handle the case where the model returns nothing meaningful
        if (!raw || raw.trim().length === 0) {
            logger.info("FactExtractionService: LLM returned empty response, treating as no facts.");
            return { facts: [], warnings: ["LLM returned an empty response."] };
        }

        let parsed;
        try {
            parsed = parseJSON(raw);
        } catch (err) {
            throw new Error(`FactExtractionService: could not parse LLM response — ${err.message}`);
        }

        const { facts, warnings } = validateFacts(parsed);

        if (warnings.length > 0) {
            logger.info("FactExtractionService: validation warnings", { warnings });
        }

        logger.info("FactExtractionService: extraction complete", {
            totalExtracted: Array.isArray(parsed) ? parsed.length : "N/A",
            validFacts: facts.length,
            warnings: warnings.length,
        });

        return { facts, warnings };
    }
}

export default FactExtractionService;
