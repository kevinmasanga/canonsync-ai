import Conflict from "../models/Conflict.js";

class ConflictRepository {
    constructor(db) {
        this.db = db;
    }

    async create({ submission_id, canon_id, confidence, reasoning, status = 'open' }) {
        const query = `
            INSERT INTO conflicts (submission_id, canon_id, confidence, reasoning, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING conflict_id, submission_id, canon_id, confidence, reasoning, status, created_at, updated_at;
        `;
        const result = await this.db.query(query, [submission_id, canon_id, confidence, reasoning, status]);
        return result.rows[0] ? new Conflict(result.rows[0]) : null;
    }

    /**
     * Return an existing conflict row for the given (submission, canon) pair,
     * or null if none exists.
     *
     * Used by ConflictPersistenceService to provide idempotent persistence:
     * if the pipeline is retried after a crash the same conflict is not inserted
     * twice.  Relies on the unique constraint uq_conflict_submission_canon added
     * by migration 003.
     *
     * @param {string} submissionId
     * @param {string} canonId
     * @returns {Promise<Conflict|null>}
     */
    async findBySubmissionAndCanon(submissionId, canonId) {
        const query = `
            SELECT conflict_id, submission_id, canon_id, confidence, reasoning, status, created_at, updated_at
            FROM conflicts
            WHERE submission_id = $1 AND canon_id = $2
            LIMIT 1;
        `;
        const result = await this.db.query(query, [submissionId, canonId]);
        return result.rows[0] ? new Conflict(result.rows[0]) : null;
    }

    async findAll(submissionId = null, { page = 1, limit = 20 } = {}) {
        const offset = (page - 1) * limit;
        const filterClause = submissionId ? `WHERE submission_id = $3` : "";
        const countFilter  = submissionId ? `WHERE submission_id = $1` : "";

        const dataParams  = submissionId ? [limit, offset, submissionId] : [limit, offset];
        const countParams = submissionId ? [submissionId] : [];

        const [dataResult, countResult] = await Promise.all([
            this.db.query(
                `SELECT conflict_id, submission_id, canon_id, confidence, reasoning, status, created_at, updated_at
                 FROM conflicts
                 ${filterClause}
                 ORDER BY created_at DESC
                 LIMIT $1 OFFSET $2;`,
                dataParams
            ),
            this.db.query(
                `SELECT COUNT(*)::int AS total FROM conflicts ${countFilter};`,
                countParams
            )
        ]);

        return {
            data: dataResult.rows.map(row => new Conflict(row)),
            pagination: {
                page,
                limit,
                total: countResult.rows[0].total,
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        };
    }

    async findById(conflictId) {
        const query = `
            SELECT conflict_id, submission_id, canon_id, confidence, reasoning, status, created_at, updated_at
            FROM conflicts
            WHERE conflict_id = $1;
        `;
        const result = await this.db.query(query, [conflictId]);
        return result.rows[0] ? new Conflict(result.rows[0]) : null;
    }

    async update(conflictId, { confidence, reasoning, status }) {
        const query = `
            UPDATE conflicts
            SET confidence  = COALESCE($1, confidence),
                reasoning   = COALESCE($2, reasoning),
                status      = COALESCE($3, status),
                updated_at  = CURRENT_TIMESTAMP
            WHERE conflict_id = $4
            RETURNING conflict_id, submission_id, canon_id, confidence, reasoning, status, created_at, updated_at;
        `;
        const result = await this.db.query(query, [confidence, reasoning, status, conflictId]);
        return result.rows[0] ? new Conflict(result.rows[0]) : null;
    }

    async delete(conflictId) {
        const query = `
            DELETE FROM conflicts
            WHERE conflict_id = $1
            RETURNING conflict_id, submission_id, canon_id, confidence, reasoning, status, created_at, updated_at;
        `;
        const result = await this.db.query(query, [conflictId]);
        return result.rows[0] ? new Conflict(result.rows[0]) : null;
    }
}

export default ConflictRepository;
