import CanonFact from "../models/CanonFact.js";

class CanonRepository {
    constructor(db) {
        this.db = db;
    }

    async create({ show_id, category, fact_text, source_episode, embedding = null, superseded_by = null, author_name }) {
        const query = `
            INSERT INTO canon_facts (show_id, category, fact_text, source_episode, embedding, superseded_by, author_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING canon_id, show_id, category, fact_text, source_episode, embedding, superseded_by, author_name, created_at;
        `;
        const result = await this.db.query(query, [
            show_id, category, fact_text, source_episode, embedding, superseded_by, author_name
        ]);
        return result.rows[0] ? new CanonFact(result.rows[0]) : null;
    }

    async findAll(showId = null, { page = 1, limit = 20 } = {}) {
        const offset = (page - 1) * limit;
        const filterClause = showId ? `WHERE show_id = $3` : "";
        const countFilter  = showId ? `WHERE show_id = $1` : "";

        const dataParams  = showId ? [limit, offset, showId] : [limit, offset];
        const countParams = showId ? [showId] : [];

        const [dataResult, countResult] = await Promise.all([
            this.db.query(
                `SELECT canon_id, show_id, category, fact_text, source_episode, embedding, superseded_by, author_name, created_at
                 FROM canon_facts
                 ${filterClause}
                 ORDER BY created_at DESC
                 LIMIT $1 OFFSET $2;`,
                dataParams
            ),
            this.db.query(
                `SELECT COUNT(*)::int AS total FROM canon_facts ${countFilter};`,
                countParams
            )
        ]);

        return {
            data: dataResult.rows.map(row => new CanonFact(row)),
            pagination: {
                page,
                limit,
                total: countResult.rows[0].total,
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
    }

    async findById(canonId) {
        const query = `
            SELECT canon_id, show_id, category, fact_text, source_episode, embedding, superseded_by, author_name, created_at
            FROM canon_facts
            WHERE canon_id = $1;
        `;
        const result = await this.db.query(query, [canonId]);
        return result.rows[0] ? new CanonFact(result.rows[0]) : null;
    }

    async update(canonId, { category, fact_text, source_episode, superseded_by, author_name }) {
        const query = `
            UPDATE canon_facts
            SET category       = COALESCE($1, category),
                fact_text      = COALESCE($2, fact_text),
                source_episode = COALESCE($3, source_episode),
                superseded_by  = COALESCE($4, superseded_by),
                author_name    = COALESCE($5, author_name)
            WHERE canon_id = $6
            RETURNING canon_id, show_id, category, fact_text, source_episode, embedding, superseded_by, author_name, created_at;
        `;
        const result = await this.db.query(query, [
            category, fact_text, source_episode, superseded_by, author_name, canonId
        ]);
        return result.rows[0] ? new CanonFact(result.rows[0]) : null;
    }

    async delete(canonId) {
        const query = `
            DELETE FROM canon_facts
            WHERE canon_id = $1
            RETURNING canon_id, show_id, category, fact_text, source_episode, embedding, superseded_by, author_name, created_at;
        `;
        const result = await this.db.query(query, [canonId]);
        return result.rows[0] ? new CanonFact(result.rows[0]) : null;
    }
}

export default CanonRepository;
