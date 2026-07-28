import { Router } from "express";
import { db } from "../config/db.js";
import ShowRepository from "../repositories/showRepository.js";
import ShowService from "../services/shows.service.js";
import ShowController from "../controllers/shows.controller.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { createShowSchema, updateShowSchema, paginationOnlySchema } from "../utils/schemas.js";

const router = Router();

const showRepository = new ShowRepository(db);
const showService = new ShowService(showRepository);
const showController = new ShowController(showService);

router.post("/",     validateBody(createShowSchema),  showController.create);
router.get("/",      validateQuery(paginationOnlySchema), showController.getAll);
router.get("/:id",   showController.getById);
router.patch("/:id", validateBody(updateShowSchema),  showController.update);
router.delete("/:id", showController.delete);

export default router;
