// backend/ai/services/EmbeddingService.js

import logger from "../../utils/logger.js";

/**
 * Generates semantic vector embeddings for extracted canon facts.
 *
 * Responsibilities:
 *   - Convert a structured fact into a compact text representation.
 *   - Generate a vector embedding via the configured LLM provider.
 *   - Validate that the returned embedding has the expected dimensionality.
 *   - Return the numeric vector for downstream use (canon storage, similarity search).
 *
 * Design note — one embedding per fact
 * -------------------------------------
 * This service intentionally generates one embedding per extracted fact rather
 * than merging all facts from a scene into a single larger unit.
 *
 * Rationale:
 *   1. Semantic precision — each fact is a self-contained statement (e.g.
 *      "John never_met Sarah").  A merged vector would blend unrelated
 *      relationships, diluting the signal for each individual claim.
 *   2. Granular retrieval — pgvector similarity search operates at the
 *      individual fact level, so we need one vector per fact to surface the
 *      exact canon records that are semantically related to each claim.
 *   3. Granular contradiction analysis — ContradictionAnalysisService
 *      reasons about one fact against its specific retrieved canon.  Per-fact
 *      embeddings make this one-to-one mapping possible.
 *   4. Testability — each embedding call is independently verifiable.
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

        // Read at construction time (not module-load time) so that dotenv has
        // already been initialised when the provider is first instantiated.
        // Default intentionally omitted here — callers must set EMBEDDING_DIMENSIONS
        // in .env after running migration 002.  We fall back to 384 only as a
        // last resort to avoid a crash in environments without the variable.
        this.expectedDimensions = parseInt(
            process.env.EMBEDDING_DIMENSIONS || "384",
            10
        );
    }

    /**
     * Serialise a structured fact into a compact text representation
     * suitable for embedding.
     *
     * The format is:  "<subject> <relationship> <object>"
     * (object omitted when null)
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
     * @throws {Error}              — If the provider call fails or returns an empty vector.
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

        if (vector.length !== this.expectedDimensions) {
            // Warn rather than hard-fail — the pipeline can still proceed, but
            // inserting a mismatched vector into PostgreSQL will fail at the DB
            // level.  This log entry is the earliest signal of a config problem.
            logger.error(
                `EmbeddingService: dimension mismatch — ` +
                `expected ${this.expectedDimensions}, got ${vector.length}. ` +
                `Ensure EMBEDDING_DIMENSIONS in .env matches the model output ` +
                `and migration 002 has been applied to the database schema.`
            );
        }

        return vector;
    }

    /**
     * Generate embeddings for multiple facts in sequence.
     *
     * Returns a parallel array of vectors aligned with the input facts array.
     * A failure on an individual fact is caught, recorded as a warning, and
     * represented as null in the output — processing continues for remaining facts.
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
