import { isValidUUID } from "../utils/validate.js";

class ConflictService {
    constructor(conflictRepository, submissionRepository, canonRepository) {
        this.conflictRepository = conflictRepository;
        this.submissionRepository = submissionRepository;
        this.canonRepository = canonRepository;
    }

    async createConflict(conflictData) {
        const { submission_id, canon_id } = conflictData;

        // Verify submission exists (FK check — business logic, not input validation)
        const submissionExists = await this.submissionRepository.findById(submission_id);
        if (!submissionExists) {
            const err = new Error(`Submission with ID ${submission_id} does not exist.`);
            err.statusCode = 404;
            throw err;
        }

        // Verify canon fact exists
        const canonFactExists = await this.canonRepository.findById(canon_id);
        if (!canonFactExists) {
            const err = new Error(`Canon Fact with ID ${canon_id} does not exist.`);
            err.statusCode = 404;
            throw err;
        }

        return await this.conflictRepository.create(conflictData);
    }

    async getAllConflicts(submissionId = null) {
        return await this.conflictRepository.findAll(submissionId);
    }

    async getConflictById(conflictId) {
        if (!isValidUUID(conflictId)) {
            const err = new Error("Invalid UUID format.");
            err.statusCode = 400;
            throw err;
        }
        const conflict = await this.conflictRepository.findById(conflictId);
        if (!conflict) {
            const err = new Error(`Conflict with ID ${conflictId} not found.`);
            err.statusCode = 404;
            throw err;
        }
        return conflict;
    }

    async updateConflict(conflictId, conflictData) {
        if (!isValidUUID(conflictId)) {
            const err = new Error("Invalid UUID format.");
            err.statusCode = 400;
            throw err;
        }

        const existingConflict = await this.conflictRepository.findById(conflictId);
        if (!existingConflict) {
            const err = new Error(`Conflict with ID ${conflictId} not found.`);
            err.statusCode = 404;
            throw err;
        }

        return await this.conflictRepository.update(conflictId, conflictData);
    }

    async deleteConflict(conflictId) {
        if (!isValidUUID(conflictId)) {
            const err = new Error("Invalid UUID format.");
            err.statusCode = 400;
            throw err;
        }
        const existingConflict = await this.conflictRepository.findById(conflictId);
        if (!existingConflict) {
            const err = new Error(`Conflict with ID ${conflictId} not found.`);
            err.statusCode = 404;
            throw err;
        }
        return await this.conflictRepository.delete(conflictId);
    }
}

export default ConflictService;
