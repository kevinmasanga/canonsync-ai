import Conflict from "../models/Conflict.js";

class ConflictRepository {
    constructor(db) {
        this.db = db;
        this._tableColumns = null; // cached Set of column names for the conflicts table
    }
    async _loadTableColumns() {
        if (this._tableColumns) return this._tableColumns;
        const q = `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'conflicts';
        `;
        const res = await this.db.query(q);
        this._tableColumns = new Set(res.rows.map(r => r.column_name));
        return this._tableColumns;
    }

    async create({ submission_id, canon_id, category = null, severity = null, confidence, supporting_evidence = [], retrieved_canon_facts = null, reasoning, status = 'open' }) {
        const cols = await this._loadTableColumns();

        const fieldMap = {
            submission_id,
            canon_id,
            category,
            severity,
            confidence,
            supporting_evidence,
            retrieved_canon_facts,
            reasoning,
            status
        };

        const columns = [];
        const values = [];
        const params = [];
        let idx = 1;

        for (const [k, v] of Object.entries(fieldMap)) {
            if (v === undefined) continue; // skip undefined
            if (!cols.has(k)) continue; // skip columns not present in DB
            columns.push(k);
            params.push(`$${idx}`);
            values.push(v);
            idx++;
        }

        if (columns.length === 0) {
            throw new Error('ConflictRepository.create: no valid columns available to insert');
        }

        const query = `INSERT INTO conflicts (${columns.join(',')}) VALUES (${params.join(',')}) RETURNING *;`;
        const result = await this.db.query(query, values);
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
                `SELECT conflict_id, submission_id, canon_id, has_conflict, category, severity, confidence, supporting_evidence, retrieved_canon_facts, reasoning, status, created_at, updated_at
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
            SELECT conflict_id, submission_id, canon_id, has_conflict, category, severity, confidence, supporting_evidence, retrieved_canon_facts, reasoning, status, created_at, updated_at
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
