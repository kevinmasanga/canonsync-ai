// backend/ai/providers/GraniteProvider.js

import { WatsonXAI } from "@ibm-cloud/watsonx-ai";
import { IamAuthenticator } from "ibm-cloud-sdk-core";
import LLMProvider from "./LLMProvider.js";
import logger from "../../utils/logger.js";

/**
 * IBM Granite provider via the watsonx.ai SDK.
 *
 * Reads configuration from environment variables:
 *   WATSONX_API_KEY      — IAM API key
 *   WATSONX_URL          — Service URL  (e.g. https://us-south.ml.cloud.ibm.com)
 *   WATSONX_PROJECT_ID   — Project or space identifier
 *   WATSONX_MODEL_ID     — Text generation model  (default: ibm/granite-3-8b-instruct)
 *   WATSONX_EMBED_MODEL  — Embedding model         (default: ibm/slate-30m-english-rtrvr-v2)
 */
class GraniteProvider extends LLMProvider {
    constructor() {
        super();

        const missing = ["WATSONX_API_KEY", "WATSONX_URL", "WATSONX_PROJECT_ID"].filter(
            (k) => !process.env[k]
        );
        if (missing.length > 0) {
            throw new Error(
                `GraniteProvider: missing required environment variables: ${missing.join(", ")}`
            );
        }

        this.projectId  = process.env.WATSONX_PROJECT_ID;
        this.modelId    = process.env.WATSONX_MODEL_ID    || "ibm/granite-3-8b-instruct";
        this.embedModel = process.env.WATSONX_EMBED_MODEL || "ibm/slate-30m-english-rtrvr-v2";

        const authenticator = new IamAuthenticator({
            apikey: process.env.WATSONX_API_KEY,
        });

        this.client = new WatsonXAI({
            version: "2024-05-31",
            serviceUrl: process.env.WATSONX_URL,
            authenticator,
        });
    }

    /**
     * Generate structured or free-form content via IBM Granite.
     *
     * @param {Object} options
     * @param {string} options.prompt       — Full prompt string (system + user combined).
     * @param {number} [options.temperature] — Sampling temperature (default 0.2).
     * @param {number} [options.maxTokens]   — Max output tokens (default 2048).
     * @returns {Promise<string>}            — Raw text response from the model.
     */
    async generateContent({ prompt, temperature = 0.2, maxTokens = 2048 }) {
        const start = Date.now();

        try {
            const response = await this.client.generateText({
                modelId: this.modelId,
                projectId: this.projectId,
                input: prompt,
                parameters: {
                    decoding_method: "greedy",
                    max_new_tokens: maxTokens,
                    temperature,
                    repetition_penalty: 1.05,
                },
            });

            const result = response.result;
            const generated = result?.results?.[0]?.generated_text ?? "";

            logger.info("GraniteProvider.generateContent", {
                provider: "IBM Granite",
                model: this.modelId,
                latencyMs: Date.now() - start,
                inputTokens:  result?.results?.[0]?.input_token_count  ?? null,
                outputTokens: result?.results?.[0]?.generated_token_count ?? null,
            });

            return generated;
        } catch (error) {
            logger.error("GraniteProvider.generateContent failed", error);
            throw new Error(`Granite content generation failed: ${error.message}`);
        }
    }

    /**
     * Generate a vector embedding for the supplied text.
     *
     * @param {string} text
     * @returns {Promise<number[]>}  — Embedding vector.
     */
    async generateEmbedding(text) {
        if (!text || typeof text !== "string" || text.trim().length === 0) {
            throw new Error("GraniteProvider.generateEmbedding: input text must be a non-empty string.");
        }

        const start = Date.now();

        try {
            const response = await this.client.embedText({
                modelId: this.embedModel,
                projectId: this.projectId,
                inputs: [text],
            });

            const embedding = response.result?.results?.[0]?.embedding;

            if (!Array.isArray(embedding) || embedding.length === 0) {
                throw new Error("Empty embedding returned by watsonx.ai.");
            }

            logger.info("GraniteProvider.generateEmbedding", {
                provider: "IBM Granite",
                model: this.embedModel,
                dimensions: embedding.length,
                latencyMs: Date.now() - start,
            });

            return embedding;
        } catch (error) {
            logger.error("GraniteProvider.generateEmbedding failed", error);
            throw new Error(`Granite embedding generation failed: ${error.message}`);
        }
    }

    /**
     * Provider metadata — used for logging and diagnostics.
     *
     * @returns {Object}
     */
    getMetadata() {
        return {
            provider: "IBM Granite (watsonx.ai)",
            model: this.modelId,
            embeddingModel: this.embedModel,
            projectId: this.projectId,
        };
    }
}

export default GraniteProvider;
