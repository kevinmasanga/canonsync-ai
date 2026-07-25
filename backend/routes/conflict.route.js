import { Router } from "express";
import { db } from "../config/db.js";
import ConflictRepository from "../repositories/conflictRepository.js";
import SubmissionRepository from "../repositories/submissionRepository.js";
import CanonRepository from "../repositories/canonRepository.js";
import ConflictService from "../services/conflict.service.js";
import ConflictController from "../controllers/conflict.controller.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
    createConflictSchema,
    updateConflictSchema,
    submissionIdQuerySchema
} from "../utils/schemas.js";

const router = Router();

const conflictRepository = new ConflictRepository(db);
const submissionRepository = new SubmissionRepository(db);
const canonRepository = new CanonRepository(db);
const conflictService = new ConflictService(conflictRepository, submissionRepository, canonRepository);
const conflictController = new ConflictController(conflictService);

router.post("/",     validateBody(createConflictSchema),    conflictController.create);
router.get("/",      validateQuery(submissionIdQuerySchema), conflictController.getAll);
router.get("/:id",   conflictController.getById);
router.patch("/:id", validateBody(updateConflictSchema),    conflictController.update);
router.delete("/:id", conflictController.delete);

export default router;
