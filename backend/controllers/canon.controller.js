class CanonController {
    constructor(canonService) {
        this.canonService = canonService;

        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req, res) {
        try {
            const canonFact = await this.canonService.createCanonFact(req.body);
            return res.status(201).json(canonFact);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            // page and limit are already numbers (coerced + defaulted by Joi validation)
            const { show_id, page, limit } = req.query;
            const result = await this.canonService.getAllCanonFacts(show_id, { page, limit });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const canonFact = await this.canonService.getCanonFactById(req.params.id);
            return res.status(200).json(canonFact);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const canonFact = await this.canonService.updateCanonFact(req.params.id, req.body);
            return res.status(200).json(canonFact);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const deletedCanon = await this.canonService.deleteCanonFact(req.params.id);
            return res.status(200).json({
                message: "Canon fact deleted successfully.",
                canon_fact: deletedCanon
            });
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
}

export default CanonController;
