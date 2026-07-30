// backend/ai/schemas/conflictSchema.js

const VALID_SEVERITIES = ["Low", "Medium", "High", "Critical"];

/**
 * Validates a conflict analysis result against the CanonSync Conflict Schema v1.0.
 *
 * Schema rules (from docs/ai/schemas/CONFLICT_SCHEMA.md):
 *   - hasConflict        : required boolean
 *   - severity           : required string — one of Low | Medium | High | Critical
 *   - category           : required non-empty string
 *   - message            : required non-empty string
 *   - supportingEvidence : required array of strings
 *   - confidence         : required number in [0.00, 1.00]
 *
 * @param {*} result   — Value to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateConflict(result) {
    const errors = [];

    if (result === null || typeof result !== "object" || Array.isArray(result)) {
        return { valid: false, errors: ["Conflict result must be a plain object."] };
    }

    // hasConflict
    if (typeof result.hasConflict !== "boolean") {
        errors.push("hasConflict: required boolean.");
    }

    // severity
    if (!VALID_SEVERITIES.includes(result.severity)) {
        errors.push(`severity: must be one of ${VALID_SEVERITIES.join(", ")}.`);
    }

    // category
    if (typeof result.category !== "string" || result.category.trim().length === 0) {
        errors.push("category: required non-empty string.");
    }

    // message
    if (typeof result.message !== "string" || result.message.trim().length === 0) {
        errors.push("message: required non-empty string.");
    }

    // supportingEvidence 
    if (!Array.isArray(result.supportingEvidence)) {
        errors.push("supportingEvidence: required array of strings.");
    } else if (result.supportingEvidence.some((e) => typeof e !== "string")) {
        errors.push("supportingEvidence: all elements must be strings.");
    }

    // confidence
    if (typeof result.confidence !== "number" || result.confidence < 0 || result.confidence > 1) {
        errors.push("confidence: required number between 0.00 and 1.00.");
    }

    return { valid: errors.length === 0, errors };
}
