import Conflict from "../models/Conflict.js";

class ConflictRepository {
    constructor(db) {
        this.db = db;
    }

    async create({ submission_id, canon_id, confidence, reasoning, status = 'unresolved' }) {
        const query = `
            INSERT INTO conflicts (submission_id, canon_id, confidence, reasoning, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING conflict_id, submission_id, canon_id, confidence, reasoning, status, created_at;
        `;
        const result = await this.db.query(query, [submission_id, canon_id, confidence, reasoning, status]);
        return result.rows[0] ? new Conflict(result.rows[0]) : null;
    }

    async findAll(submissionId = null) {
        let query = `
            SELECT conflict_id, submission_id, canon_id, confidence, reasoning, status, created_at
            FROM conflicts
        `;
        const params = [];
        if (submissionId) {
            query += ` WHERE submission_id = $1`;
            params.push(submissionId);
        }
        query += ` ORDER BY created_at DESC;`;

        const result = await this.db.query(query, params);
        return result.rows.map(row => new Conflict(row));
    }

    async findById(conflictId) {
        const query = `
            SELECT conflict_id, submission_id, canon_id, confidence, reasoning, status, created_at
            FROM conflicts
            WHERE conflict_id = $1;
        `;
        const result = await this.db.query(query, [conflictId]);
        return result.rows[0] ? new Conflict(result.rows[0]) : null;
    }

    async update(conflictId, { confidence, reasoning, status }) {
        const query = `
            UPDATE conflicts
            SET confidence = COALESCE($1, confidence),
                reasoning = COALESCE($2, reasoning),
                status = COALESCE($3, status)
            WHERE conflict_id = $4
            RETURNING conflict_id, submission_id, canon_id, confidence, reasoning, status, created_at;
        `;
        const result = await this.db.query(query, [confidence, reasoning, status, conflictId]);
        return result.rows[0] ? new Conflict(result.rows[0]) : null;
    }

    async delete(conflictId) {
        const query = `
            DELETE FROM conflicts
            WHERE conflict_id = $1
            RETURNING conflict_id, submission_id, canon_id, confidence, reasoning, status, created_at;
        `;
        const result = await this.db.query(query, [conflictId]);
        return result.rows[0] ? new Conflict(result.rows[0]) : null;
    }
}

export default ConflictRepository;
