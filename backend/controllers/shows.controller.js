class ShowController {
    constructor(showService) {
        this.showService = showService;

        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req, res) {
        try {
            const show = await this.showService.createShow(req.body);
            return res.status(201).json(show);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            // page and limit are already numbers (coerced + defaulted by Joi validation)
            const { page, limit } = req.query;
            const result = await this.showService.getAllShows({ page, limit });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const show = await this.showService.getShowById(req.params.id);
            return res.status(200).json(show);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const show = await this.showService.updateShow(req.params.id, req.body);
            return res.status(200).json(show);
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const deletedShow = await this.showService.deleteShow(req.params.id);
            return res.status(200).json({
                message: "Show deleted successfully.",
                show: deletedShow
            });
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
}

export default ShowController;