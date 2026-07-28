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

    async findAll(showId = null, { page = 1, limit = 20 } = {}) {
        const offset = (page - 1) * limit;
        const filterClause = showId ? `WHERE show_id = $3` : "";
        const countFilter  = showId ? `WHERE show_id = $1` : "";

        const dataParams  = showId ? [limit, offset, showId] : [limit, offset];
        const countParams = showId ? [showId] : [];

        const [dataResult, countResult] = await Promise.all([
            this.db.query(
                `SELECT submission_id, show_id, script, status, author_name, created_at
                 FROM submissions
                 ${filterClause}
                 ORDER BY created_at DESC
                 LIMIT $1 OFFSET $2;`,
                dataParams
            ),
            this.db.query(
                `SELECT COUNT(*)::int AS total FROM submissions ${countFilter};`,
                countParams
            )
        ]);

        return {
            data: dataResult.rows.map(row => new Submission(row)),
            pagination: {
                page,
                limit,
                total: countResult.rows[0].total,
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
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
            SET script      = COALESCE($1, script),
                status      = COALESCE($2, status),
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
