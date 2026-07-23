import "dotenv/config";
import express from "express";
import { db } from "./config/db.js"

const app = express();
const PORT = process.env.PORT || 3000;
async function startServer() {
    try {
        await db.connect();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();