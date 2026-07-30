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

    /**
     * Insert a new canon fact, skipping the insert silently when an identical
     * fact already exists for the same show (idempotent upsert).
     *
     * Relies on the unique constraint uq_canon_fact_per_show(show_id, fact_text)
     * added by migration 003.  When the constraint fires the row is NOT inserted
     * and the method returns the existing row instead, keeping the caller's
     * behaviour identical on first run and on any subsequent retry.
     *
     * @param {Object} params  — Same shape as create().
     * @returns {Promise<CanonFact|null>}
     */
    async createIfNotExists({ show_id, category, fact_text, source_episode, embedding = null, superseded_by = null, author_name }) {
        // Attempt the insert; do nothing on duplicate (show_id, fact_text).
        const insertQuery = `
            INSERT INTO canon_facts (show_id, category, fact_text, source_episode, embedding, superseded_by, author_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT ON CONSTRAINT uq_canon_fact_per_show DO NOTHING
            RETURNING canon_id, show_id, category, fact_text, source_episode, embedding, superseded_by, author_name, created_at;
        `;
        const insertResult = await this.db.query(insertQuery, [
            show_id, category, fact_text, source_episode, embedding, superseded_by, author_name,
        ]);

        if (insertResult.rows[0]) {
            return new CanonFact(insertResult.rows[0]);
        }

        // Row already existed — fetch and return it so the pipeline has the canon_id.
        const selectQuery = `
            SELECT canon_id, show_id, category, fact_text, source_episode, embedding, superseded_by, author_name, created_at
            FROM canon_facts
            WHERE show_id = $1 AND fact_text = $2;
        `;
        const selectResult = await this.db.query(selectQuery, [show_id, fact_text]);
        return selectResult.rows[0] ? new CanonFact(selectResult.rows[0]) : null;
    }

    /**
     * Semantic similarity search using pgvector cosine distance.
     *
     * Returns the Top-K canon facts whose embedding is most similar to the
     * supplied vector, optionally scoped to a specific show.
     *
     * @param {number[]} embedding   — Query vector (must match column dimensions).
     * @param {string|null} showId   — Optional UUID to scope results to one show.
     * @param {number} topK          — Maximum number of results to return (default 10).
     * @returns {Promise<Array<{ canonFact: CanonFact, similarity: number }>>}
     */
    async findSimilar(embedding, showId = null, topK = 10) {
        // pgvector expects the vector literal as a string: '[0.1,0.2,...]'
        const vectorLiteral = `[${embedding.join(",")}]`;

        const showFilter = showId ? "AND show_id = $3" : "";
        const params     = showId
            ? [vectorLiteral, topK, showId]
            : [vectorLiteral, topK];

        const query = `
            SELECT
                canon_id,
                show_id,
                category,
                fact_text,
                source_episode,
                embedding,
                superseded_by,
                author_name,
                created_at,
                1 - (embedding <=> $1::vector) AS similarity
            FROM canon_facts
            WHERE embedding IS NOT NULL
            ${showFilter}
            ORDER BY embedding <=> $1::vector
            LIMIT $2;
        `;

        const result = await this.db.query(query, params);

        return result.rows.map((row) => ({
            canonFact:  new CanonFact(row),
            similarity: parseFloat(row.similarity),
        }));
    }
}

export default CanonRepository;
