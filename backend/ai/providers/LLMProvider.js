// backend/ai/providers/LLMProvider.js

/**
 * Abstract base class for Large Language Model providers.
 *
 * Every provider (Gemini, IBM Granite, OpenAI, etc.)
 * must extend this class and implement its methods.
 */
class LLMProvider {
    constructor() {
        if (new.target === LLMProvider) {
            throw new Error(
                "LLMProvider is an abstract class and cannot be instantiated directly."
            );
        }
    }

    /**
     * Generate a structured response from a prompt.
     *
     * @param {Object} options
     * @param {string} options.prompt - Prompt to send to the model.
     * @param {Object} [options.schema] - Optional JSON schema for structured output.
     * @param {number} [options.temperature] - Sampling temperature.
     * @returns {Promise<Object>}
     */
    async generateContent(options) {
        throw new Error("generateContent() must be implemented by the provider.");
    }

    /**
     * Generate vector embeddings for text.
     *
     * @param {string} text
     * @returns {Promise<number[]>}
     */
    async generateEmbedding(text) {
        throw new Error("generateEmbedding() must be implemented by the provider.");
    }

    /**
     * Returns metadata about the provider.
     * Useful for logging, diagnostics, and configuration.
     *
     * @returns {Object}
     */
    getMetadata() {
        throw new Error("getMetadata() must be implemented by the provider.");
    }
}

export default LLMProvider;