import pg from "pg";
import logger from "../utils/logger.js";
const { Pool } = pg;

export class Database {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        this.pool.on("error", (err) => {
            logger.error("Unexpected error on idle database client", err);
        });
    }

    async connect() {
        try {
            const client = await this.pool.connect();
            logger.info("PostgreSQL connected successfully");
            client.release();
        } catch (err) {
            logger.error("Database connection failed", err);
            process.exit(1);
        }
    }

    query(text, params) {
        return this.pool.query(text, params);
    }
}

export const db = new Database();


