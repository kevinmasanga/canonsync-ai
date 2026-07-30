// backend/ai/schemas/factSchema.js

/**
 * Validates a single extracted canon fact against the CanonSync Fact Schema v1.0.
 *
 * Schema rules (from docs/ai/schemas/FACT_SCHEMA.md):
 *   - subject       : required, non-empty string
 *   - relationship  : required, non-empty string
 *   - object        : optional, string or null
 *   - confidence    : required, number in [0.00, 1.00]
 *
 * @param {*} fact   — Value to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateFact(fact) {
    const errors = [];

    if (fact === null || typeof fact !== "object" || Array.isArray(fact)) {
        return { valid: false, errors: ["Fact must be a plain object."] };
    }

    // subject
    if (typeof fact.subject !== "string" || fact.subject.trim().length === 0) {
        errors.push("subject: required non-empty string.");
    }

    // relationship
    if (typeof fact.relationship !== "string" || fact.relationship.trim().length === 0) {
        errors.push("relationship: required non-empty string.");
    }

    // object — optional but must be string or null when present
    if (fact.object !== undefined && fact.object !== null && typeof fact.object !== "string") {
        errors.push("object: must be a string or null.");
    }

    // confidence
    if (typeof fact.confidence !== "number" || fact.confidence < 0 || fact.confidence > 1) {
        errors.push("confidence: required number between 0.00 and 1.00.");
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Validates an array of extracted facts.
 * Filters out invalid entries and returns only conforming facts along with any warnings.
 *
 * @param {*} raw                     — Value returned by parseJSON.
 * @returns {{ facts: Object[], warnings: string[] }}
 * @throws {Error}                    — If raw is not an array at all.
 */
export function validateFacts(raw) {
    if (!Array.isArray(raw)) {
        throw new Error("Fact extraction response must be a JSON array.");
    }

    const facts    = [];
    const warnings = [];

    for (let i = 0; i < raw.length; i++) {
        const { valid, errors } = validateFact(raw[i]);
        if (valid) {
            facts.push(raw[i]);
        } else {
            warnings.push(`Fact[${i}] discarded — ${errors.join("; ")}`);
        }
    }

    return { facts, warnings };
}
