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
            show_id,
            category,
            fact_text,
            source_episode,
            embedding,
            superseded_by,
            author_name
        ]);
        return result.rows[0] ? new CanonFact(result.rows[0]) : null;
    }

    async findAll(showId = null) {
        let query = `
            SELECT canon_id, show_id, category, fact_text, source_episode, embedding, superseded_by, author_name, created_at
            FROM canon_facts
        `;
        const params = [];
        if (showId) {
            query += ` WHERE show_id = $1`;
            params.push(showId);
        }
        query += ` ORDER BY created_at DESC;`;

        const result = await this.db.query(query, params);
        return result.rows.map(row => new CanonFact(row));
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
            SET category = COALESCE($1, category),
                fact_text = COALESCE($2, fact_text),
                source_episode = COALESCE($3, source_episode),
                superseded_by = COALESCE($4, superseded_by),
                author_name = COALESCE($5, author_name)
            WHERE canon_id = $6
            RETURNING canon_id, show_id, category, fact_text, source_episode, embedding, superseded_by, author_name, created_at;
        `;
        const result = await this.db.query(query, [
            category,
            fact_text,
            source_episode,
            superseded_by,
            author_name,
            canonId
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
