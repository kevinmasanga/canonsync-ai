import "dotenv/config";
import { validateEnv } from "./utils/env.js";
validateEnv();

import { db } from "./config/db.js";
import { app } from "./app.js";
import logger from "./utils/logger.js";

process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", reason);
});

process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", error);
    process.exit(1);
});

const PORT = process.env.PORT || 3000;
async function startServer() {
    try {
        await db.connect();

        const server = app.listen(PORT, () => {
            logger.info(`Server running on port http://localhost:${PORT}`);
            // logger.info(`API documentation at http://localhost:${PORT}/api-docs`);
        });

        server.on("error", (error) => {
            logger.error("Server failed to start", error);
            process.exit(1);
        });
    } catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1);
    }
}

startServer();