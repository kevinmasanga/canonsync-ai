import { isValidUUID } from "../utils/validate.js";

class CanonService {
    constructor(canonRepository, showRepository) {
        this.canonRepository = canonRepository;
        this.showRepository = showRepository;
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

        return await this.canonRepository.create(canonData);
    }

    async getAllCanonFacts(showId = null) {
        return await this.canonRepository.findAll(showId);
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
