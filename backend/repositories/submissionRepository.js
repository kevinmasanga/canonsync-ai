import Submission from "../models/Submission.js";

class SubmissionRepository {
    constructor(db) {
        this.db = db;
    }

    async create({ show_id, script, status = 'pending', author_name }) {
        const query = `
            INSERT INTO submissions (show_id, script, status, author_name)
            VALUES ($1, $2, $3, $4)
            RETURNING submission_id, show_id, script, status, author_name, created_at;
        `;
        const result = await this.db.query(query, [show_id, script, status, author_name]);
        return result.rows[0] ? new Submission(result.rows[0]) : null;
    }

    async findAll(showId = null) {
        let query = `
            SELECT submission_id, show_id, script, status, author_name, created_at
            FROM submissions
        `;
        const params = [];
        if (showId) {
            query += ` WHERE show_id = $1`;
            params.push(showId);
        }
        query += ` ORDER BY created_at DESC;`;

        const result = await this.db.query(query, params);
        return result.rows.map(row => new Submission(row));
    }

    async findById(submissionId) {
        const query = `
            SELECT submission_id, show_id, script, status, author_name, created_at
            FROM submissions
            WHERE submission_id = $1;
        `;
        const result = await this.db.query(query, [submissionId]);
        return result.rows[0] ? new Submission(result.rows[0]) : null;
    }

    async update(submissionId, { script, status, author_name }) {
        const query = `
            UPDATE submissions
            SET script = COALESCE($1, script),
                status = COALESCE($2, status),
                author_name = COALESCE($3, author_name)
            WHERE submission_id = $4
            RETURNING submission_id, show_id, script, status, author_name, created_at;
        `;
        const result = await this.db.query(query, [script, status, author_name, submissionId]);
        return result.rows[0] ? new Submission(result.rows[0]) : null;
    }

    async delete(submissionId) {
        const query = `
            DELETE FROM submissions
            WHERE submission_id = $1
            RETURNING submission_id, show_id, script, status, author_name, created_at;
        `;
        const result = await this.db.query(query, [submissionId]);
        return result.rows[0] ? new Submission(result.rows[0]) : null;
    }
}

export default SubmissionRepository;
