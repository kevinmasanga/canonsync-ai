// backend/ai/services/ConflictPersistenceService.js

import logger from "../../utils/logger.js";

/**
 * Persists validated conflict analysis results to the database.
 *
 * Responsibilities:
 *   - Accept a conflict analysis result and the associated submission / canon IDs.
 *   - Use the existing ConflictRepository to store the conflict record.
 *   - Return the persisted Conflict model instance.
 *
 * This service persists data only.
 * It does not perform AI reasoning or validate conflict schema.
 */
class ConflictPersistenceService {
    /**
     * @param {import('../../repositories/conflictRepository.js').default} conflictRepository
     */
    constructor(conflictRepository) {
        this.conflictRepository = conflictRepository;
    }

    /**
     * Persist a conflict analysis result.
     *
     * A record is only written when a conflict was detected (hasConflict === true).
     * When no conflict exists the method returns null without touching the database.
     *
     * @param {Object} options
     * @param {string}   options.submissionId  — UUID of the submission being analyzed.
     * @param {string}   options.canonId       — UUID of the canon fact that was contradicted.
     * @param {Object}   options.conflictResult — Validated conflict object (Conflict Schema).
     * @returns {Promise<Object|null>}          — Persisted Conflict record, or null if no conflict.
     * @throws {Error}                          — If the database write fails.
     */
    async persistConflict({ submissionId, canonId, conflictResult }) {
        if (!conflictResult.hasConflict) {
            logger.info("ConflictPersistenceService: no conflict detected — skipping persistence.", {
                submissionId,
            });
            return null;
        }

        logger.info("ConflictPersistenceService: persisting conflict", {
            submissionId,
            canonId,
            severity:   conflictResult.severity,
            confidence: conflictResult.confidence,
        });

        // Build the reasoning string from all available conflict detail
        const reasoning = _buildReasoning(conflictResult);

        let conflict;
        try {
            conflict = await this.conflictRepository.create({
                submission_id: submissionId,
                canon_id:      canonId,
                confidence:    conflictResult.confidence,
                reasoning,
                status:        "open",
            });
        } catch (err) {
            throw new Error(`ConflictPersistenceService: database write failed — ${err.message}`);
        }

        logger.info("ConflictPersistenceService: conflict persisted", {
            conflictId: conflict.conflict_id,
        });

        return conflict;
    }

    /**
     * Persist multiple conflicts produced by analyzing one submission against
     * several retrieved canon facts.
     *
     * Only entries where conflictResult.hasConflict === true are written.
     *
     * @param {Array<{ submissionId: string, canonId: string, conflictResult: Object }>} items
     * @returns {Promise<{ persisted: Object[], warnings: string[] }>}
     */
    async persistConflicts(items) {
        if (!Array.isArray(items)) {
            throw new Error("ConflictPersistenceService.persistConflicts: items must be an array.");
        }

        const persisted = [];
        const warnings  = [];

        for (const item of items) {
            try {
                const result = await this.persistConflict(item);
                if (result) persisted.push(result);
            } catch (err) {
                warnings.push(`Failed to persist conflict for canonId ${item.canonId}: ${err.message}`);
                logger.error("ConflictPersistenceService: failed to persist conflict", err);
            }
        }

        return { persisted, warnings };
    }
}

/**
 * Compose a human-readable reasoning string from the conflict result fields.
 *
 * @param {Object} conflictResult
 * @returns {string}
 */
function _buildReasoning(conflictResult) {
    const parts = [
        `[${conflictResult.severity}] ${conflictResult.category}`,
        conflictResult.message,
    ];

    if (conflictResult.supportingEvidence?.length > 0) {
        parts.push("Evidence: " + conflictResult.supportingEvidence.join(" | "));
    }

    return parts.join("\n");
}

export default ConflictPersistenceService;
