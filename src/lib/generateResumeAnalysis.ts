import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { CONFIG_DIR, getConfig, getErrorMessage } from "../helpers.js";
import { resumeAnalysisSchema } from "./schema.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const HISTORY_FILE = join(CONFIG_DIR, "history.json");

export async function generateResumeAnalysis(
  resumeMarkdown: string,
  jobDescription: string,
) {
  const SYSTEM_PROMPT = `You are an expert technical recruiter and resume reviewer.
Analyze the resume against the job description and return structured feedback.

Rules:
- Judge only against the provided job description. Do not invent requirements.
- Be specific and evidence-based; quote resume/JD wording where useful.
- Each item is one concise, standalone point. Return an empty array if none apply.`;

  const prompt = `Resume:
${resumeMarkdown}

Job Description:
${jobDescription}`;

  try {
    await mkdir(CONFIG_DIR, { recursive: true });
    const config = await getConfig();
    const apiKey = config.apiKey;

    if (!apiKey) {
      console.error(
        "API key is not set. Please set it using the 'set-api-key' command.",
      );
      process.exit(1);
    }

    const openai = createOpenAI({
      apiKey: apiKey,
    });

    const { text } = await generateText({
      model: openai("gpt-5.4-mini"),
      output: Output.object({
        schema: resumeAnalysisSchema,
      }),
      system: SYSTEM_PROMPT,
      prompt,
    });

    const parsedOutput = JSON.parse(text);

    // save run to history
    await writeFile(
      HISTORY_FILE,
      JSON.stringify(parsedOutput, null, 2),
      "utf8",
    );
    return parsedOutput;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Error generating resume analysis:", errorMessage);
    process.exit(1);
  }
}
