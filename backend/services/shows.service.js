import { isValidUUID } from "../utils/validate.js";

class ShowService {
    constructor(showRepository) {
        this.showRepository = showRepository;
    }

    async createShow(showData) {
        return await this.showRepository.create(showData);
    }

    async getAllShows() {
        return await this.showRepository.findAll();
    }

    async getShowById(showId) {
        if (!isValidUUID(showId)) {
            const err = new Error("Invalid UUID format.");
            err.statusCode = 400;
            throw err;
        }
        const show = await this.showRepository.findById(showId);
        if (!show) {
            const err = new Error(`Show with ID ${showId} not found.`);
            err.statusCode = 404;
            throw err;
        }
        return show;
    }

    async updateShow(showId, showData) {
        if (!isValidUUID(showId)) {
            const err = new Error("Invalid UUID format.");
            err.statusCode = 400;
            throw err;
        }
        const existingShow = await this.showRepository.findById(showId);
        if (!existingShow) {
            const err = new Error(`Show with ID ${showId} not found.`);
            err.statusCode = 404;
            throw err;
        }
        return await this.showRepository.update(showId, showData);
    }

    async deleteShow(showId) {
        if (!isValidUUID(showId)) {
            const err = new Error("Invalid UUID format.");
            err.statusCode = 400;
            throw err;
        }
        const existingShow = await this.showRepository.findById(showId);
        if (!existingShow) {
            const err = new Error(`Show with ID ${showId} not found.`);
            err.statusCode = 404;
            throw err;
        }
        return await this.showRepository.delete(showId);
    }
}

export default ShowService;
