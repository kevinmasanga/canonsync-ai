// backend/ai/utils/parseJSON.js

/**
 * Safely parse JSON from an LLM response string.
 *
 * LLMs sometimes wrap JSON in markdown code fences such as:
 *   ```json\n[...]\n```
 * or leading/trailing whitespace.
 *
 * This utility strips those wrappers before parsing.
 *
 * @param {string} raw   — Raw string returned by the LLM.
 * @returns {*}          — Parsed JavaScript value.
 * @throws {Error}       — If the string cannot be parsed as valid JSON.
 */
export function parseJSON(raw) {
    if (typeof raw !== "string") {
        throw new Error(`parseJSON: expected a string, received ${typeof raw}`);
    }

    // Strip markdown code fences:  ```json ... ``` or ``` ... ```
    let cleaned = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/, "")
        .trim();

    // Some models prefix with a natural language sentence before the JSON.
    // Find the first occurrence of '[' or '{' and start from there.
    const jsonStart = cleaned.search(/[\[{]/);
    if (jsonStart > 0) {
        cleaned = cleaned.slice(jsonStart);
    }

    // Similarly trim anything after the last ']' or '}'
    const jsonEnd = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));
    if (jsonEnd !== -1 && jsonEnd < cleaned.length - 1) {
        cleaned = cleaned.slice(0, jsonEnd + 1);
    }

    try {
        return JSON.parse(cleaned);
    } catch (err) {
        throw new Error(
            `parseJSON: failed to parse LLM response as JSON. ` +
            `Parse error: ${err.message}. ` +
            `Raw (first 300 chars): ${raw.slice(0, 300)}`
        );
    }
}
