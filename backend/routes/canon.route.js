import { Router } from "express";
import { db } from "../config/db.js";
import CanonRepository from "../repositories/canonRepository.js";
import ShowRepository from "../repositories/showRepository.js";
import CanonService from "../services/canon.service.js";
import CanonController from "../controllers/canon.controller.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
    createCanonFactSchema,
    updateCanonFactSchema,
    showIdQuerySchema
} from "../utils/schemas.js";

const router = Router();

const canonRepository = new CanonRepository(db);
const showRepository = new ShowRepository(db);
const canonService = new CanonService(canonRepository, showRepository);
const canonController = new CanonController(canonService);

router.post("/",     validateBody(createCanonFactSchema), canonController.create);
router.get("/",      validateQuery(showIdQuerySchema),    canonController.getAll);
router.get("/:id",   canonController.getById);
router.patch("/:id", validateBody(updateCanonFactSchema), canonController.update);
router.delete("/:id", canonController.delete);

export default router;
