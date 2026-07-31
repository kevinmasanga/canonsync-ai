import fs from "fs";
import path from "path";

const LOG_DIR = path.resolve("logs");

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const colors = {
    reset: "\x1b[0m",
    info: "\x1b[36m",     // Cyan
    error: "\x1b[31m",    // Red
    timestamp: "\x1b[90m" // Gray
};

class Logger {
    constructor() {
        this.combinedLogPath = path.join(LOG_DIR, "combined.log");
        this.errorLogPath = path.join(LOG_DIR, "error.log");
    }

    _formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaString = meta ? ` | ${JSON.stringify(meta)}` : "";
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
    }

    _writeToFile(filePath, message) {
        fs.appendFile(filePath, message + "\n", (err) => {
            if (err) {
                console.error(`Failed to write log to ${filePath}:`, err.message);
            }
        });
    }

    warn(message, meta) {
        const rawMsg = this._formatMessage("warn", message, meta);
        const timestamp = new Date().toISOString();
        const formatted = `${colors.timestamp}[${timestamp}]${colors.reset} ${colors.error}[WARN]${colors.reset} ${message}${meta ? ` | ${colors.timestamp}${JSON.stringify(meta)}${colors.reset}` : ""}`;

        process.stderr.write(formatted + "\n");
        this._writeToFile(this.combinedLogPath, rawMsg);
    }

    info(message, meta) {
        const rawMsg = this._formatMessage("info", message, meta);
        const timestamp = new Date().toISOString();
        const formatted = `${colors.timestamp}[${timestamp}]${colors.reset} ${colors.info}[INFO]${colors.reset} ${message}${meta ? ` | ${colors.timestamp}${JSON.stringify(meta)}${colors.reset}` : ""}`;

        process.stdout.write(formatted + "\n");
        this._writeToFile(this.combinedLogPath, rawMsg);
    }

    error(message, errorOrMeta) {
        let meta = errorOrMeta;
        if (errorOrMeta instanceof Error) {
            meta = {
                message: errorOrMeta.message,
                stack: errorOrMeta.stack
            };
        }

        const rawMsg = this._formatMessage("error", message, meta);
        const timestamp = new Date().toISOString();
        const formatted = `${colors.timestamp}[${timestamp}]${colors.reset} ${colors.error}[ERROR]${colors.reset} ${message}${meta ? ` | ${colors.error}${JSON.stringify(meta)}${colors.reset}` : ""}`;

        process.stderr.write(formatted + "\n");
        this._writeToFile(this.combinedLogPath, rawMsg);
        this._writeToFile(this.errorLogPath, rawMsg);
    }
}

export const logger = new Logger();
export default logger;
