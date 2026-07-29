import "dotenv/config";
import GeminiProvider from "./GeminiProvider.js";

async function testGemini() {
    try {
        const provider = new GeminiProvider();

        console.log("Gemini Provider initialized successfully.");
        console.log(provider.getMetadata());

        const response = await provider.generateContent({
            prompt: "Explain what a database is in one sentence."
        });

        console.log("\nGemini Response:");
        console.log(response);

    } catch (error) {
        console.error("Gemini test failed:");
        console.error(error.message);

        process.exit(1);
    }
}

testGemini();