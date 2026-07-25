import { Router } from "express";
import showRoutes from "./shows.route.js";
import canonRoutes from "./canon.route.js";
import submissionRoutes from "./submission.route.js";
import conflictRoutes from "./conflict.route.js";

const router = Router();

router.use("/shows", showRoutes);
router.use("/canon", canonRoutes);
router.use("/submissions", submissionRoutes);
router.use("/conflicts", conflictRoutes);

export default router;
