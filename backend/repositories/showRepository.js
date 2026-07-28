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

    async findAll({ page = 1, limit = 20 } = {}) {
        const offset = (page - 1) * limit;

        const [dataResult, countResult] = await Promise.all([
            this.db.query(
                `SELECT show_id, title, description, created_at
                 FROM shows
                 ORDER BY created_at DESC
                 LIMIT $1 OFFSET $2;`,
                [limit, offset]
            ),
            this.db.query(`SELECT COUNT(*)::int AS total FROM shows;`)
        ]);

        return {
            data: dataResult.rows.map(row => new Show(row)),
            pagination: {
                page,
                limit,
                total: countResult.rows[0].total,
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
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
