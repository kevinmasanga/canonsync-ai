import { isValidUUID } from "../utils/validate.js";

const VALID_SUBMISSION_STATUSES = ['pending', 'processed', 'failed'];

class SubmissionService {
    constructor(submissionRepository, showRepository) {
        this.submissionRepository = submissionRepository;
        this.showRepository       = showRepository;
    }

    async createSubmission(submissionData) {
        const { show_id, status } = submissionData;

        // Validate status ENUM if explicitly provided
        if (status !== undefined && !VALID_SUBMISSION_STATUSES.includes(status)) {
            const err = new Error(`Invalid status "${status}". Must be one of: ${VALID_SUBMISSION_STATUSES.join(', ')}.`);
            err.statusCode = 400;
            throw err;
        }

        // Verify show exists (FK check — business logic, not input validation)
        const showExists = await this.showRepository.findById(show_id);
        if (!showExists) {
            const err = new Error(`Show with ID ${show_id} does not exist.`);
            err.statusCode = 404;
            throw err;
        }

        return await this.submissionRepository.create(submissionData);
    }

    async getAllSubmissions(showId = null, { page, limit } = {}) {
        return await this.submissionRepository.findAll(showId, { page, limit });
    }

    async getSubmissionById(submissionId) {
        if (!isValidUUID(submissionId)) {
            const err = new Error("Invalid UUID format.");
            err.statusCode = 400;
            throw err;
        }
        const submission = await this.submissionRepository.findById(submissionId);
        if (!submission) {
            const err = new Error(`Submission with ID ${submissionId} not found.`);
            err.statusCode = 404;
            throw err;
        }
        return submission;
    }

    async updateSubmission(submissionId, submissionData) {
        if (!isValidUUID(submissionId)) {
            const err = new Error("Invalid UUID format.");
            err.statusCode = 400;
            throw err;
        }

        // Validate status ENUM if being updated
        const { status } = submissionData;
        if (status !== undefined && !VALID_SUBMISSION_STATUSES.includes(status)) {
            const err = new Error(`Invalid status "${status}". Must be one of: ${VALID_SUBMISSION_STATUSES.join(', ')}.`);
            err.statusCode = 400;
            throw err;
        }

        const existingSubmission = await this.submissionRepository.findById(submissionId);
        if (!existingSubmission) {
            const err = new Error(`Submission with ID ${submissionId} not found.`);
            err.statusCode = 404;
            throw err;
        }

        return await this.submissionRepository.update(submissionId, submissionData);
    }

    async deleteSubmission(submissionId) {
        if (!isValidUUID(submissionId)) {
            const err = new Error("Invalid UUID format.");
            err.statusCode = 400;
            throw err;
        }
        const existingSubmission = await this.submissionRepository.findById(submissionId);
        if (!existingSubmission) {
            const err = new Error(`Submission with ID ${submissionId} not found.`);
            err.statusCode = 404;
            throw err;
        }
        return await this.submissionRepository.delete(submissionId);
    }
}

export default SubmissionService;
