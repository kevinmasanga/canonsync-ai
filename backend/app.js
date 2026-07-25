import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import compression from "compression";
import logRequest from "./middleware/logger.js";
import apiRouter from "./routes/index.js";
import logger from "./utils/logger.js";

export const app = express();

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// 3. HTTP Parameter Pollution protection
app.use(hpp());

// 4. Response Compression (Gzip)
app.use(compression());

// 5. Rate Limiting (Prevent Brute-force/DoS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: "Too many requests from this IP, please try again later." },
    standardHeaders: true,
    legacyHeaders: false
});
app.use("/api/", limiter);

// 6. Built-in body parsers & logger
app.use(logRequest);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 7. Serve API documentation from docs folder
app.use("/docs", express.static(path.resolve("../docs")));

// 8. Main API Router
app.use("/api/v1/", apiRouter);

// 9. Catch-all for non-existent routes
app.use((req, res, next) => {
    const err = new Error(`Route ${req.method} ${req.url} not found`);
    err.statusCode = 404;
    next(err);
});


// 10. Global error handler
app.use((err, req, res, next) => {
    logger.error(`Error processing ${req.method} ${req.url}`, err);
    const status = err.statusCode || 500;
    return res.status(status).json({
        error: err.message || "Internal Server Error"
    });
});
