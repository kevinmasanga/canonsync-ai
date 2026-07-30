// backend/ai/services/SemanticSearchService.js

import logger from "../../utils/logger.js";

const DEFAULT_TOP_K = parseInt(process.env.SEMANTIC_SEARCH_TOP_K || "10", 10);
const MIN_SIMILARITY = parseFloat(process.env.SEMANTIC_SEARCH_MIN_SIMILARITY || "0.0");

/**
 * Retrieves semantically similar canon facts from PostgreSQL using pgvector.
 *
 * Responsibilities:
 *   - Accept an embedding vector.
 *   - Query the canon repository for the Top-K most similar facts.
 *   - Optionally filter by show and minimum similarity threshold.
 *   - Return ranked canon facts to the orchestrator.
 *
 * This service performs retrieval only.
 * It does not perform AI reasoning or generate embeddings.
 */
class SemanticSearchService {
    /**
     * @param {import('../../repositories/canonRepository.js').default} canonRepository
     */
    constructor(canonRepository) {
        this.canonRepository = canonRepository;
    }

    /**
     * Search for the most semantically similar canon facts.
     *
     * @param {Object} options
     * @param {number[]} options.embedding    — Query vector.
     * @param {string|null} [options.showId]  — Optional: restrict search to one show.
     * @param {number} [options.topK]         — Max results (default from env or 10).
     * @param {number} [options.minSimilarity] — Minimum cosine similarity to include (default 0.0).
     * @returns {Promise<Array<{ canonFact: Object, similarity: number }>>}
     *   Sorted descending by similarity score.
     * @throws {Error} — If the database query fails.
     */
    async searchSimilarFacts({ embedding, showId = null, topK = DEFAULT_TOP_K, minSimilarity = MIN_SIMILARITY }) {
        if (!Array.isArray(embedding) || embedding.length === 0) {
            throw new Error(
                "SemanticSearchService.searchSimilarFacts: embedding must be a non-empty numeric array."
            );
        }

        logger.info("SemanticSearchService: searching for similar canon facts", {
            dimensions: embedding.length,
            showId: showId ?? "all",
            topK,
            minSimilarity,
        });

        let results;
        try {
            results = await this.canonRepository.findSimilar(embedding, showId, topK);
        } catch (err) {
            throw new Error(`SemanticSearchService: database query failed — ${err.message}`);
        }

        // Apply minimum similarity threshold
        const filtered = minSimilarity > 0
            ? results.filter((r) => r.similarity >= minSimilarity)
            : results;

        logger.info("SemanticSearchService: search complete", {
            totalReturned: results.length,
            afterFilter: filtered.length,
        });

        return filtered;
    }
}

export default SemanticSearchService;
