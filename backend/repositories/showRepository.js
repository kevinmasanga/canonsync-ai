import Show from "../models/Show.js";

class ShowRepository {
    constructor(db) {
        this.db = db;
    }

    async create({ title, description }) {
        const query = `
            INSERT INTO shows (title, description)
            VALUES ($1, $2)
            RETURNING show_id, title, description, created_at;
        `;
        const result = await this.db.query(query, [title, description]);
        return result.rows[0] ? new Show(result.rows[0]) : null;
    }

    async findAll() {
        const query = `
            SELECT show_id, title, description, created_at
            FROM shows
            ORDER BY created_at DESC;
        `;
        const result = await this.db.query(query);
        return result.rows.map(row => new Show(row));
    }

    async findById(showId) {
        const query = `
            SELECT show_id, title, description, created_at
            FROM shows
            WHERE show_id = $1;
        `;
        const result = await this.db.query(query, [showId]);
        return result.rows[0] ? new Show(result.rows[0]) : null;
    }

    async update(showId, { title, description }) {
        const query = `
            UPDATE shows
            SET title = COALESCE($1, title),
                description = COALESCE($2, description)
            WHERE show_id = $3
            RETURNING show_id, title, description, created_at;
        `;
        const result = await this.db.query(query, [title, description, showId]);
        return result.rows[0] ? new Show(result.rows[0]) : null;
    }

    async delete(showId) {
        const query = `
            DELETE FROM shows
            WHERE show_id = $1
            RETURNING show_id, title, description, created_at;
        `;
        const result = await this.db.query(query, [showId]);
        return result.rows[0] ? new Show(result.rows[0]) : null;
    }
}

export default ShowRepository;
