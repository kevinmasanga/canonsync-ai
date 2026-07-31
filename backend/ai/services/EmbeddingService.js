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
        const envDimensionsRaw = process.env.EMBEDDING_DIMENSIONS;
        const envDimensions = envDimensionsRaw ? parseInt(envDimensionsRaw, 10) : null;

        const providerMetadata = provider?.getMetadata?.() ?? {};
        const providerDimensions = providerMetadata.embeddingDimensions ?? null;

        this.expectedDimensions = envDimensions || providerDimensions || 384;
        this.dimensionSource = envDimensions
            ? "EMBEDDING_DIMENSIONS"
            : providerDimensions
                ? "provider metadata"
                : "default fallback";
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
    async _validateVector(vector, context) {
        if (!Array.isArray(vector) || vector.length === 0) {
            throw new Error(`EmbeddingService: ${context} returned an invalid or empty embedding.`);
        }

        if (vector.length !== this.expectedDimensions) {
            const message = `EmbeddingService: dimension mismatch for ${context} — expected ${this.expectedDimensions} (${this.dimensionSource}), got ${vector.length}. ` +
                `Update EMBEDDING_DIMENSIONS to match your embedding model output and verify the canon_facts.embedding column is the same VECTOR dimension.`;
            logger.error(message, {
                provider: this.provider.getMetadata?.().provider,
                embeddingModel: this.provider.getMetadata?.().embeddingModel,
                expectedDimensions: this.expectedDimensions,
                actualDimensions: vector.length,
                dimensionSource: this.dimensionSource,
            });
            throw new Error(message);
        }
    }

    async _generateEmbeddingForText(text, contextDescription = "text") {
        logger.info("EmbeddingService: generating embedding", {
            context: contextDescription,
            provider: this.provider.getMetadata().provider,
        });

        let vector;
        try {
            vector = await this.provider.generateEmbedding(text);
        } catch (err) {
            throw new Error(`EmbeddingService: provider embedding call failed — ${err.message}`);
        }

        await this._validateVector(vector, contextDescription);
        return vector;
    }

    async generateEmbedding(fact) {
        if (!fact || typeof fact !== "object") {
            throw new Error("EmbeddingService.generateEmbedding: fact must be a plain object.");
        }

        const text = this._factToText(fact);
        return await this._generateEmbeddingForText(text, `fact: ${text}`);
    }

    async generateEmbeddingForText(text) {
        if (typeof text !== "string" || text.trim().length === 0) {
            throw new Error("EmbeddingService.generateEmbeddingForText: input text must be a non-empty string.");
        }

        return await this._generateEmbeddingForText(text.trim(), "submission text");
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
