import { Router } from "express";
import { db } from "../config/db.js";
import CanonRepository from "../repositories/canonRepository.js";
import ShowRepository from "../repositories/showRepository.js";
import CanonService from "../services/canon.service.js";
import CanonController from "../controllers/canon.controller.js";
import GraniteProvider from "../ai/providers/GraniteProvider.js";
import EmbeddingService from "../ai/services/EmbeddingService.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
    createCanonFactSchema,
    updateCanonFactSchema,
    showIdQuerySchema
} from "../utils/schemas.js";

const router = Router();

const canonRepository = new CanonRepository(db);
const showRepository = new ShowRepository(db);
let canonController = null;

function getCanonController() {
    if (!canonController) {
        const provider = new GraniteProvider();
        const embeddingService = new EmbeddingService(provider);
        const canonService = new CanonService(canonRepository, showRepository, embeddingService);
        canonController = new CanonController(canonService);
    }
    return canonController;
}

function createLazyHandler(methodName) {
    return async (req, res, next) => {
        try {
            const controller = getCanonController();
            return await controller[methodName](req, res, next);
        } catch (err) {
            next(err);
        }
    };
}

router.post("/",     validateBody(createCanonFactSchema), createLazyHandler("create"));
router.get("/",      validateQuery(showIdQuerySchema),    createLazyHandler("getAll"));
router.get("/:id",   createLazyHandler("getById"));
router.patch("/:id", validateBody(updateCanonFactSchema), createLazyHandler("update"));
router.delete("/:id", createLazyHandler("delete"));

export default router;
