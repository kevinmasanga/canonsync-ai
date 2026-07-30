// backend/ai/services/EmbeddingService.js

import logger from "../../utils/logger.js";

// The database schema stores VECTOR(1536).
// The IBM slate-30m model produces 384-dim; slate-125m produces 768-dim.
// If using a model that returns a different dimension, set this env var accordingly.
// The pipeline will store whatever dimension the configured model returns,
// but will warn loudly if it does not match the schema expectation.
const EXPECTED_DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS || "1536", 10);

/**
 * Generates semantic vector embeddings for extracted canon facts.
 *
 * Responsibilities:
 *   - Convert a structured fact (or any text) into a vector embedding.
 *   - Validate that the returned embedding has the expected dimensionality.
 *   - Return the numeric vector for downstream use (storage, similarity search).
 *
 * This service generates embeddings only.
 * It does not store embeddings, perform searches, or reason about facts.
 */
class EmbeddingService {
    /**
     * @param {import('../providers/LLMProvider.js').default} provider
     */
    constructor(provider) {
        this.provider = provider;
    }

    /**
     * Serialise a structured fact into a compact text representation
     * suitable for embedding.
     *
     * @param {Object} fact
     * @returns {string}
     * @private
     */
    _factToText(fact) {
        const obj = fact.object ? ` ${fact.object}` : "";
        return `${fact.subject} ${fact.relationship}${obj}`.trim();
    }

    /**
     * Generate a vector embedding for a single structured canon fact.
     *
     * @param {Object} fact   — A valid fact conforming to the CanonSync Fact Schema.
     * @returns {Promise<number[]>}  — Embedding vector.
     * @throws {Error}              — If embedding fails or dimensions are wrong.
     */
    async generateEmbedding(fact) {
        if (!fact || typeof fact !== "object") {
            throw new Error("EmbeddingService.generateEmbedding: fact must be a plain object.");
        }

        const text = this._factToText(fact);

        logger.info("EmbeddingService: generating embedding", {
            factText: text,
            provider: this.provider.getMetadata().provider,
        });

        let vector;
        try {
            vector = await this.provider.generateEmbedding(text);
        } catch (err) {
            throw new Error(`EmbeddingService: provider embedding call failed — ${err.message}`);
        }

        if (!Array.isArray(vector) || vector.length === 0) {
            throw new Error("EmbeddingService: provider returned an invalid or empty embedding.");
        }

        if (vector.length !== EXPECTED_DIMENSIONS) {
            // Warn rather than hard-fail — allows flexibility when using different models.
            logger.error(
                `EmbeddingService: dimension mismatch — expected ${EXPECTED_DIMENSIONS}, got ${vector.length}. ` +
                `Update EMBEDDING_DIMENSIONS env var or the database schema to match.`
            );
        }

        return vector;
    }

    /**
     * Generate embeddings for multiple facts in sequence.
     * Returns a parallel array of vectors aligned with the input facts array.
     * Failures on individual facts are caught and reported as nulls with warnings.
     *
     * @param {Object[]} facts
     * @returns {Promise<{ vectors: (number[]|null)[], warnings: string[] }>}
     */
    async generateEmbeddings(facts) {
        if (!Array.isArray(facts)) {
            throw new Error("EmbeddingService.generateEmbeddings: facts must be an array.");
        }

        const vectors  = [];
        const warnings = [];

        for (let i = 0; i < facts.length; i++) {
            try {
                const vector = await this.generateEmbedding(facts[i]);
                vectors.push(vector);
            } catch (err) {
                warnings.push(`Fact[${i}] embedding failed — ${err.message}`);
                vectors.push(null);
            }
        }

        return { vectors, warnings };
    }
}

export default EmbeddingService;
