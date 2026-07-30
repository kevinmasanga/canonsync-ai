import Joi from "joi";

const uuid = () => Joi.string().uuid({ version: "uuidv4" });

// ── Pagination (shared) ───────────────────────────────────────────────────────

export const paginationSchema = Joi.object({
    page:  Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
}).options({ allowUnknown: true });

// ── Shows ────────────────────────────────────────────────────────────────────

export const createShowSchema = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(2000).optional().allow("", null)
});

export const updateShowSchema = Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    description: Joi.string().max(2000).optional().allow("", null)
}).min(1).message("At least one field (title, description) must be provided.");

// ── Canon Facts ──────────────────────────────────────────────────────────────

const CANON_CATEGORIES = ["character", "lore", "timeline", "location", "relationship", "event", "world_rule", "other"];

export const createCanonFactSchema = Joi.object({
    show_id: uuid().required(),
    category: Joi.string().valid(...CANON_CATEGORIES).required(),
    fact_text: Joi.string().min(1).max(5000).required(),
    source_episode: Joi.string().max(100).optional().allow("", null),
    embedding: Joi.array().items(Joi.number()).optional().allow(null),
    superseded_by: uuid().optional().allow(null),
    author_name: Joi.string().max(100).optional().allow("", null)
});

export const updateCanonFactSchema = Joi.object({
    category: Joi.string().valid(...CANON_CATEGORIES).optional(),
    fact_text: Joi.string().min(1).max(5000).optional(),
    source_episode: Joi.string().max(100).optional().allow("", null),
    superseded_by: uuid().optional().allow(null),
    author_name: Joi.string().max(100).optional().allow("", null)
}).min(1).message("At least one field must be provided.");

// ── Submissions ──────────────────────────────────────────────────────────────

const SUBMISSION_STATUSES = ["pending", "processed", "failed"];

export const createSubmissionSchema = Joi.object({
    show_id: uuid().required(),
    script: Joi.string().min(1).max(100000).required(),
    author_name: Joi.string().max(100).optional().allow("", null),
    status: Joi.string().valid(...SUBMISSION_STATUSES).optional()
});

export const updateSubmissionSchema = Joi.object({
    script: Joi.string().min(1).max(100000).optional(),
    status: Joi.string().valid(...SUBMISSION_STATUSES).optional(),
    author_name: Joi.string().max(100).optional().allow("", null)
}).min(1).message("At least one field must be provided.");

// ── Conflicts ────────────────────────────────────────────────────────────────

const CONFLICT_STATUSES = ["open", "resolved", "ignored"];

export const createConflictSchema = Joi.object({
    submission_id: uuid().required(),
    canon_id: uuid().required(),
    confidence: Joi.number().min(0).max(1).optional().allow(null),
    reasoning: Joi.string().max(5000).optional().allow("", null),
    status: Joi.string().valid(...CONFLICT_STATUSES).optional()
});

export const updateConflictSchema = Joi.object({
    confidence: Joi.number().min(0).max(1).optional().allow(null),
    reasoning: Joi.string().max(5000).optional().allow("", null),
    status: Joi.string().valid(...CONFLICT_STATUSES).optional()
}).min(1).message("At least one field must be provided.");

// ── Query param schemas ───────────────────────────────────────────────────────

export const showIdQuerySchema = Joi.object({
    show_id: uuid().optional(),
    page:    Joi.number().integer().min(1).default(1),
    limit:   Joi.number().integer().min(1).max(100).default(20)
}).options({ allowUnknown: true });

export const submissionIdQuerySchema = Joi.object({
    submission_id: uuid().optional(),
    page:          Joi.number().integer().min(1).default(1),
    limit:         Joi.number().integer().min(1).max(100).default(20)
}).options({ allowUnknown: true });

export const paginationOnlySchema = Joi.object({
    page:  Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
}).options({ allowUnknown: true });
