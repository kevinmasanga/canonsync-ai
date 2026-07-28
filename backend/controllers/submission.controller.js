class SubmissionController {
    constructor(submissionService) {
        this.submissionService = submissionService;

        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req, res) {
        try {
            const submission = await this.submissionService.createSubmission(req.body);
            return res.status(201).json(submission);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            // page and limit are already numbers (coerced + defaulted by Joi validation)
            const { show_id, page, limit } = req.query;
            const result = await this.submissionService.getAllSubmissions(show_id, { page, limit });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const submission = await this.submissionService.getSubmissionById(req.params.id);
            return res.status(200).json(submission);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const submission = await this.submissionService.updateSubmission(req.params.id, req.body);
            return res.status(200).json(submission);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const deletedSubmission = await this.submissionService.deleteSubmission(req.params.id);
            return res.status(200).json({
                message: "Submission deleted successfully.",
                submission: deletedSubmission
            });
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
}

export default SubmissionController;
