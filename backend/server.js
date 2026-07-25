import "dotenv/config";
import { validateEnv } from "./utils/env.js";
validateEnv();

import { db } from "./config/db.js";
import { app } from "./app.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 3000;
async function startServer() {
    try {
        await db.connect();

        app.listen(PORT, () => {
            logger.info(`Server running on port http://localhost:${PORT}`);
            logger.info(`API documentation at http://localhost:${PORT}/docs/index.html`);
        });
    } catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1);
    }
}

startServer();