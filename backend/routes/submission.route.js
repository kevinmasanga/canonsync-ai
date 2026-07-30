// backend/routes/submission.route.js

import { Router } from "express";
import { db } from "../config/db.js";

// ── Repositories ──────────────────────────────────────────────────────────────
import SubmissionRepository from "../repositories/submissionRepository.js";
import ShowRepository from "../repositories/showRepository.js";
import CanonRepository from "../repositories/canonRepository.js";
import ConflictRepository from "../repositories/conflictRepository.js";

// ── Domain services ───────────────────────────────────────────────────────────
import SubmissionService from "../services/submission.service.js";

// ── AI providers ──────────────────────────────────────────────────────────────
import GraniteProvider from "../ai/providers/GraniteProvider.js";

// ── AI services ───────────────────────────────────────────────────────────────
import FactExtractionService from "../ai/services/FactExtractionService.js";
import EmbeddingService from "../ai/services/EmbeddingService.js";
import SemanticSearchService from "../ai/services/SemanticSearchService.js";
import ContradictionAnalysisService from "../ai/services/ContradictionAnalysisService.js";
import ConflictPersistenceService from "../ai/services/ConflictPersistenceService.js";

// ── AI orchestrator ───────────────────────────────────────────────────────────
import CanonPipeline from "../ai/orchestrator/CanonPipeline.js";

// ── Controllers / validation ──────────────────────────────────────────────────
import SubmissionController from "../controllers/submission.controller.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
    createSubmissionSchema,
    updateSubmissionSchema,
    showIdQuerySchema,
} from "../utils/schemas.js";
import logger from "../utils/logger.js";

const router = Router();

// ── Wire up repositories ──────────────────────────────────────────────────────
const submissionRepository = new SubmissionRepository(db);
const showRepository       = new ShowRepository(db);
const canonRepository      = new CanonRepository(db);
const conflictRepository   = new ConflictRepository(db);

// ── Build AI pipeline (lazy — GraniteProvider validates env vars on construction) ──
let pipeline = null;

function getPipeline() {
    if (!pipeline) {
        const provider = new GraniteProvider();

        pipeline = new CanonPipeline({
            factExtractionService:        new FactExtractionService(provider),
            embeddingService:             new EmbeddingService(provider),
            semanticSearchService:        new SemanticSearchService(canonRepository),
            contradictionAnalysisService: new ContradictionAnalysisService(provider),
            conflictPersistenceService:   new ConflictPersistenceService(conflictRepository),
            canonRepository,
            submissionRepository,
        });
    }
    return pipeline;
}

// ── Submission service — wraps AI pipeline trigger ────────────────────────────
const submissionService = new SubmissionService(
    submissionRepository,
    showRepository
);

// ── Controllers ───────────────────────────────────────────────────────────────
const submissionController = new SubmissionController(submissionService);

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/submissions
 *
 * Creates the submission record then fires the AI pipeline.
 * The pipeline runs asynchronously after the 201 response is sent so that
 * the writer gets an immediate acknowledgement.  Submission status transitions:
 *   pending  →  processed | failed
 */
router.post("/", validateBody(createSubmissionSchema), async (req, res) => {
    try {
        // 1. Persist the raw submission (status = pending)
        const submission = await submissionService.createSubmission(req.body);

        // 2. Respond immediately — the client receives the pending record
        res.status(201).json(submission);

        // 3. Fire the AI pipeline in the background (do not await in the response chain)
        setImmediate(async () => {
            try {
                const result = await getPipeline().processSubmission({
                    submissionId: submission.submission_id,
                    script:       submission.script,
                    showId:       submission.show_id,
                    authorName:   submission.author_name,
                });

                logger.info("CanonPipeline: async processing complete", {
                    submissionId: submission.submission_id,
                    status:       result.status,
                    conflicts:    result.conflicts?.length ?? 0,
                });
            } catch (err) {
                logger.error("CanonPipeline: async processing threw an unexpected error", err);
            }
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ error: error.message });
    }
});

router.get("/",      validateQuery(showIdQuerySchema),     submissionController.getAll);
router.get("/:id",   submissionController.getById);
router.patch("/:id", validateBody(updateSubmissionSchema), submissionController.update);
router.delete("/:id", submissionController.delete);

export default router;
