class ConflictController {
    constructor(conflictService) {
        this.conflictService = conflictService;

        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req, res) {
        try {
            const conflict = await this.conflictService.createConflict(req.body);
            return res.status(201).json(conflict);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            // page and limit are already numbers (coerced + defaulted by Joi validation)
            const { submission_id, page, limit } = req.query;
            const result = await this.conflictService.getAllConflicts(submission_id, { page, limit });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const conflict = await this.conflictService.getConflictById(req.params.id);
            return res.status(200).json(conflict);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const conflict = await this.conflictService.updateConflict(req.params.id, req.body);
            return res.status(200).json(conflict);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const deletedConflict = await this.conflictService.deleteConflict(req.params.id);
            return res.status(200).json({
                message: "Conflict deleted successfully.",
                conflict: deletedConflict
            });
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
}

export default ConflictController;
