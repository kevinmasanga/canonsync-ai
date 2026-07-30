import { isValidUUID } from "../utils/validate.js";
import logger from "../utils/logger.js";

class CanonService {
    constructor(canonRepository, showRepository, embeddingService = null) {
        this.canonRepository = canonRepository;
        this.showRepository = showRepository;
        this.embeddingService = embeddingService;
    }

    async _buildEmbeddingText(canonData) {
        const pieces = [canonData.fact_text];
        if (canonData.category) pieces.push(`category: ${canonData.category}`);
        if (canonData.source_episode) pieces.push(`source_episode: ${canonData.source_episode}`);
        if (canonData.author_name) pieces.push(`author_name: ${canonData.author_name}`);
        return pieces.filter(Boolean).join(" \n");
    }

    async _generateEmbedding(canonData) {
        if (!this.embeddingService) {
            return null;
        }

        const text = await this._buildEmbeddingText(canonData);
        try {
            return await this.embeddingService.generateEmbeddingForText(text);
        } catch (err) {
            logger.warn("CanonService: failed to generate embedding for canon fact", {
                fact_text: canonData.fact_text,
                error: err.message,
            });
            return null;
        }
    }

    async createCanonFact(canonData) {
        const { show_id, superseded_by } = canonData;

        // Verify show exists (FK check — business logic, not input validation)
        const showExists = await this.showRepository.findById(show_id);
        if (!showExists) {
            const err = new Error(`Show with ID ${show_id} does not exist.`);
            err.statusCode = 404;
            throw err;
        }

        if (superseded_by) {
            const supersededExists = await this.canonRepository.findById(superseded_by);
            if (!supersededExists) {
                const err = new Error(`Canon Fact with ID ${superseded_by} to supersede does not exist.`);
                err.statusCode = 404;
                throw err;
            }
        }

        if (!canonData.embedding && this.embeddingService) {
            canonData.embedding = await this._generateEmbedding(canonData);
        }

        return await this.canonRepository.create(canonData);
    }

    async getAllCanonFacts(showId = null, { page, limit } = {}) {
        return await this.canonRepository.findAll(showId, { page, limit });
    }

    async getCanonFactById(canonId) {
        if (!isValidUUID(canonId)) {
            const err = new Error("Invalid UUID format.");
            err.statusCode = 400;
            throw err;
        }
        const canonFact = await this.canonRepository.findById(canonId);
        if (!canonFact) {
            const err = new Error(`Canon Fact with ID ${canonId} not found.`);
            err.statusCode = 404;
            throw err;
        }
        return canonFact;
    }

    async updateCanonFact(canonId, canonData) {
        if (!isValidUUID(canonId)) {
            const err = new Error("Invalid UUID format.");
            err.statusCode = 400;
            throw err;
        }

        const existingCanon = await this.canonRepository.findById(canonId);
        if (!existingCanon) {
            const err = new Error(`Canon Fact with ID ${canonId} not found.`);
            err.statusCode = 404;
            throw err;
        }

        if (canonData.superseded_by) {
            const supersededExists = await this.canonRepository.findById(canonData.superseded_by);
            if (!supersededExists) {
                const err = new Error(`Canon Fact with ID ${canonData.superseded_by} to supersede does not exist.`);
                err.statusCode = 404;
                throw err;
            }
        }

        if (this.embeddingService && ("fact_text" in canonData || "category" in canonData || "source_episode" in canonData || "author_name" in canonData)) {
            const mergedCanon = {
                ...existingCanon,
                ...canonData,
            };
            canonData.embedding = await this._generateEmbedding(mergedCanon);
        }

        return await this.canonRepository.update(canonId, canonData);
    }

    async deleteCanonFact(canonId) {
        if (!isValidUUID(canonId)) {
            const err = new Error("Invalid UUID format.");
            err.statusCode = 400;
            throw err;
        }
        const existingCanon = await this.canonRepository.findById(canonId);
        if (!existingCanon) {
            const err = new Error(`Canon Fact with ID ${canonId} not found.`);
            err.statusCode = 404;
            throw err;
        }
        return await this.canonRepository.delete(canonId);
    }
}

export default CanonService;
