import { Router } from "express";
import { db } from "../config/db.js";
import SubmissionRepository from "../repositories/submissionRepository.js";
import ShowRepository from "../repositories/showRepository.js";
import SubmissionService from "../services/submission.service.js";
import SubmissionController from "../controllers/submission.controller.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
    createSubmissionSchema,
    updateSubmissionSchema,
    showIdQuerySchema
} from "../utils/schemas.js";

const router = Router();

const submissionRepository = new SubmissionRepository(db);
const showRepository = new ShowRepository(db);
const submissionService = new SubmissionService(submissionRepository, showRepository);
const submissionController = new SubmissionController(submissionService);

router.post("/",     validateBody(createSubmissionSchema), submissionController.create);
router.get("/",      validateQuery(showIdQuerySchema),     submissionController.getAll);
router.get("/:id",   submissionController.getById);
router.patch("/:id", validateBody(updateSubmissionSchema), submissionController.update);
router.delete("/:id", submissionController.delete);

export default router;
