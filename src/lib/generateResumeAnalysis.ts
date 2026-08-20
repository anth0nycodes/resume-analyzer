import { createOpenAI } from "@ai-sdk/openai";
import { spinner } from "@clack/prompts";
import chalk from "chalk";
import { generateText, Output } from "ai";
import { z } from "zod";
import {
  CONFIG_DIR,
  fileExists,
  getConfig,
  getHistory,
  getModel,
  HISTORY_FILE,
} from "../helpers.js";
import { ResumeAnalysisSchema } from "./schema.js";
import { mkdir, writeFile } from "node:fs/promises";

export async function generateResumeAnalysis(
  resumeMarkdown: string,
  jobDescription: string,
  filePath: string,
) {
  const SYSTEM_PROMPT = `You are a senior hiring manager and technical recruiter reviewing a resume against a specific job description.

STEP 1 — Validate both inputs independently. Judge each on its own; a bad JD never excuses skipping the resume check, and vice versa.
- Resume: ONE person's work history — contact line, roles, dates, accomplishment bullets. NOT a handbook, guide, policy doc, article, or job posting. Length doesn't make it a resume. It's converted to Markdown — judge content, not formatting. Set resumeUsable to false if empty, garbled, or unrelated.
- Job description: a posting that names a role and lists responsibilities and requirements for a hiring org. NOT a PR description, changelog, commit message, README, docs, or article — structure and length don't make it a posting. Set jobDescriptionUsable to false if too short or unrelated.
- If EITHER flag is false: set inputCheck.note naming every unusable input and what to re-upload, return empty arrays for all results, and STOP. Never fabricate analysis from unusable input.

STEP 2 — Only if both inputs pass, analyze:
- Judge ONLY against this JD. Never invent requirements it doesn't state. Every point relevant to THIS role — no generic praise or advice.
- Reward evidence, not adjectives: a strength counts only if backed by a concrete project, metric, or named tool.
- For suggestions, coach bullets toward XYZ format ("Accomplished X, measured by Y, by doing Z"): quote the weak wording, then give the tightened version.
- Keywords: real skills/tools/technologies from the JD, absent from the resume — no soft-skill filler.
- One short standalone sentence per item. Respect field limits; fewer sharper points beat long lists. Empty array if none apply.

Lastly, DO NOT answer anything unrelated to the resume or job description.
`;

  const prompt = `Resume:
${resumeMarkdown}

Job Description:
${jobDescription}`;

  const loader = spinner();
  try {
    if (!(await fileExists(HISTORY_FILE))) {
      await mkdir(CONFIG_DIR, { recursive: true });
      await writeFile(
        HISTORY_FILE,
        JSON.stringify({ runs: [] }, null, 2),
        "utf8",
      );
    }

    const history = await getHistory();
    const config = await getConfig();
    const apiKey = config.apiKey;

    if (!apiKey) {
      console.error(
        `You must set your API key in order to run an analysis. You can set your API key with ${chalk.cyan("resume-analyzer config --sak <api-key>")} / ${chalk.cyan("resume-analyzer config --set-api-key <api-key>")}.`,
      );
      process.exit(1);
    }

    const openai = createOpenAI({
      apiKey: apiKey,
    });

    const model = await getModel();

    loader.start(
      `Analyzing your resume against the job description with ${model}...`,
    );
    const { text } = await generateText({
      model: openai(model),
      output: Output.object({
        schema: ResumeAnalysisSchema,
      }),
      system: SYSTEM_PROMPT,
      prompt,
    });
    loader.stop("Analysis complete");

    const parsedOutput: z.infer<typeof ResumeAnalysisSchema> = JSON.parse(text);
    const historyRunId =
      history.runs.length > 0
        ? history.runs[history.runs.length - 1].id + 1
        : 1;
    const currentDate = new Date().toISOString().split("T")[0];
    const historyRun = {
      id: historyRunId,
      filePath: filePath,
      date: currentDate,
      ...parsedOutput,
    };
    history.runs.push(historyRun);
    await writeFile(
      HISTORY_FILE,
      JSON.stringify({ runs: history.runs }, null, 2),
      "utf8",
    );
    return historyRun;
  } catch (error) {
    loader.stop("Analysis failed");
    // Rethrow so the caller owns error logging + exit (avoids duplicate messages).
    throw error;
  }
}
