// backend/ai/providers/testGranite.js
//
// Standalone connectivity test for IBM Granite via watsonx.ai.
//
// Purpose:
//   Proves end-to-end communication with IBM watsonx.ai before any pipeline
//   code is written.  Run this script after filling in your .env file.
//
// What it tests:
//   1. Environment variable validation  — fails fast with a clear message if
//      any required variable is missing.
//   2. GraniteProvider construction     — IAM authentication handshake happens
//      lazily on the first API call, not on construction.
//   3. Text generation (generateContent) — sends a simple prompt to Granite
//      and prints the response, model ID, latency, and token usage.
//
// Usage:
//   cd canonsync-ai/backend
//   node ai/providers/testGranite.js
//
// Expected output on success:
//   ✔  Provider initialised
//   ✔  Text generation passed
//   ... (see sections below)
//
// Exit codes:
//   0 — all checks passed
//   1 — one or more checks failed (error printed to stderr)

import "dotenv/config";
import GraniteProvider from "./GraniteProvider.js";

// ── Helpers ────────────────────────────────────────────────────────────────────

const PASS = "✔ ";
const FAIL = "✖ ";
const SEP  = "─".repeat(56);

function heading(title) {
    console.log(`\n${SEP}`);
    console.log(` ${title}`);
    console.log(SEP);
}

function printKV(label, value) {
    console.log(`  ${label.padEnd(20)} ${value}`);
}

// ── Main test ──────────────────────────────────────────────────────────────────

async function testGranite() {
    let exitCode = 0;

    // ── Step 1: Environment variables ─────────────────────────────────────────
    heading("Step 1 — Environment Variables");

    const required = ["WATSONX_API_KEY", "WATSONX_URL", "WATSONX_PROJECT_ID"];
    const missing  = required.filter((k) => !process.env[k]);

    if (missing.length > 0) {
        console.error(`${FAIL} Missing required variables:\n  ${missing.join("\n  ")}`);
        console.error("\n  Create canonsync-ai/backend/.env and set these variables.");
        console.error("  See .env.example for the full template.\n");
        process.exit(1);
    }

    const optional = {
        WATSONX_MODEL_ID:    process.env.WATSONX_MODEL_ID    || "(default: ibm/granite-3-8b-instruct)",
        WATSONX_EMBED_MODEL: process.env.WATSONX_EMBED_MODEL || "(default: ibm/slate-30m-english-rtrvr-v2)",
    };

    printKV("WATSONX_URL",        process.env.WATSONX_URL);
    printKV("WATSONX_PROJECT_ID", process.env.WATSONX_PROJECT_ID.slice(0, 8) + "…");
    printKV("WATSONX_API_KEY",    "(set — value hidden)");
    printKV("Model ID",           optional.WATSONX_MODEL_ID);
    printKV("Embed model",        optional.WATSONX_EMBED_MODEL);
    console.log(`\n${PASS} All required environment variables are present.`);

    // ── Step 2: Provider construction ─────────────────────────────────────────
    heading("Step 2 — Provider Construction");

    let provider;
    try {
        provider = new GraniteProvider();
        const meta = provider.getMetadata();
        printKV("Provider",       meta.provider);
        printKV("Model ID",       meta.model);
        printKV("Embed model",    meta.embeddingModel);
        printKV("Project ID",     meta.projectId.slice(0, 8) + "…");
        console.log(`\n${PASS} GraniteProvider constructed successfully.`);
    } catch (err) {
        console.error(`${FAIL} GraniteProvider construction failed:\n  ${err.message}`);
        process.exit(1);
    }

    // ── Step 3: Text generation ────────────────────────────────────────────────
    heading("Step 3 — Text Generation  (generateContent)");

    const PROMPT = "In one sentence, what is a television writers' room?";

    console.log(`  Prompt: "${PROMPT}"`);
    console.log("  Sending request to watsonx.ai...\n");

    try {
        const start    = Date.now();
        const response = await provider.generateContent({
            prompt:      PROMPT,
            temperature: 0.0,
            maxTokens:   120,
        });
        const latencyMs = Date.now() - start;

        if (!response || response.trim().length === 0) {
            throw new Error("Received an empty response from the model.");
        }

        printKV("Response:",     "");
        console.log(`\n    "${response.trim()}"\n`);
        printKV("Model",         provider.getMetadata().model);
        printKV("Latency",       `${latencyMs} ms`);

        // Token usage is visible in the logger output — re-surface it here
        // by making a second call that extracts raw result fields.
        const rawResponse = await provider.client.generateText({
            modelId:    provider.modelId,
            projectId:  provider.projectId,
            input:      PROMPT,
            parameters: { decoding_method: "greedy", max_new_tokens: 5 },
        });
        const rawResult = rawResponse?.result?.results?.[0];
        if (rawResult) {
            printKV("Input tokens",  rawResult.input_token_count  ?? "n/a");
            printKV("Output tokens", rawResult.generated_token_count ?? "n/a");
            printKV("Stop reason",   rawResult.stop_reason ?? "n/a");
        }

        console.log(`\n${PASS} Text generation passed.`);
    } catch (err) {
        console.error(`\n${FAIL} Text generation failed:\n  ${err.message}`);
        if (err.message.includes("401") || err.message.includes("Unauthorized")) {
            console.error("  → Check that WATSONX_API_KEY is valid and has not expired.");
        } else if (err.message.includes("404") || err.message.includes("not found")) {
            console.error("  → Check that WATSONX_PROJECT_ID exists in your watsonx.ai instance.");
        } else if (err.message.includes("ENOTFOUND") || err.message.includes("ECONNREFUSED")) {
            console.error("  → Check that WATSONX_URL is correct and reachable from this machine.");
        }
        exitCode = 1;
    }

    // ── Summary ────────────────────────────────────────────────────────────────
    heading("Summary");

    if (exitCode === 0) {
        console.log(`${PASS} All checks passed. IBM Granite connectivity is confirmed.\n`);
        console.log("  Next step: review GraniteProvider.js, then proceed to PR 3");
        console.log("  (FactExtractionService + EmbeddingService).\n");
    } else {
        console.error(`${FAIL} One or more checks failed. Fix the errors above before proceeding.\n`);
    }

    process.exit(exitCode);
}

testGranite();
