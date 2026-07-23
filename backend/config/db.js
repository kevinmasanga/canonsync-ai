import { Pool } from "pg";

export class Database{
    constructor(){
        this.pool = new Pool({
            host:process.env.DB_HOST,
            port:process.env.DB_PORT,
            database:process.env.DB_NAME,
            user:process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
    }
    async connect(){
        try {
            const client = await this.pool.connect();
            console.log("PostgreSql connection successfully");
            client.release();
            
        } catch (err) {
            console.error("Database connection failed");
            console.error(err.message);
            process.exit(1);
        }
    }

    query(text, params){
        return this.pool.query(text, params);
    }
}

export const db = new Database();
