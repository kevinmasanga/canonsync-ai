// backend/ai/providers/GeminiProvider.js

import { GoogleGenAI } from "@google/genai";
import LLMProvider from "./LLMProvider.js";

class GeminiProvider extends LLMProvider {
    constructor() {
        super();

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured.");
        }

        this.client = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        this.model = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
    }

    /**
     * Generate structured or free-form content.
     *
     * @param {Object} options
     * @param {string} options.prompt
     * @param {Object} [options.schema]
     * @param {number} [options.temperature]
     * @returns {Promise<Object>}
     */
    async generateContent({
        prompt,
        schema = null,
        temperature = 0.2,
    }) {
        try {
            const config = {
                temperature,
            };

            // Enable structured JSON output when a schema is supplied.
            if (schema) {
                config.responseMimeType = "application/json";
                config.responseSchema = schema;
            }

            const response = await this.client.models.generateContent({
                model: this.model,
                contents: prompt,
                config,
            });

            return response.text;
        } catch (error) {
            throw new Error(`Gemini content generation failed: ${error.message}`);
        }
    }

    /**
     * Generate vector embeddings.
     *
     * @param {string} text
     * @returns {Promise<number[]>}
     */
    async generateEmbedding(text) {
        try {
            const response = await this.client.models.embedContent({
                model: "text-embedding-004",
                contents: text,
            });

            return response.embeddings[0].values;
        } catch (error) {
            throw new Error(`Gemini embedding generation failed: ${error.message}`);
        }
    }

    /**
     * Provider metadata.
     */
    getMetadata() {
        return {
            provider: "Google Gemini",
            model: this.model,
            embeddingModel: "text-embedding-004",
            embeddingDimensions: 1536,
        };
    }
}

export default GeminiProvider;