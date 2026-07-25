
import logger from "../utils/logger.js";

function logRequest(req, res, next) {
    logger.info(`${req.method} ${req.originalUrl || req.url}`);
    next();
}

export default logRequest;