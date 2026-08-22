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

OUTPUT RULES — apply to every field, always:
- Write in English, even when the resume or job description is in another language. Never translate proper nouns: keep company names, tool names, and technologies spelled as they appear in the source.
- Every item must be a self-contained, grammatically complete sentence ending in a period. Never stop mid-sentence or mid-word.
- Stay within each field's stated word budget. If a point does not fit, make a shorter point — never let it run long and get truncated.

STEP 1 — Validate both inputs independently. Judge each on its own; a bad JD never excuses skipping the resume check, and vice versa.
- Resume: ONE person's work history — contact line, roles, dates, accomplishment bullets. NOT a handbook, guide, policy doc, article, or job posting. Length doesn't make it a resume. It's converted to Markdown — judge content, not formatting. Set resumeUsable to false if empty, garbled, or unrelated.
- Job description: a posting that names a role and lists responsibilities and requirements for a hiring org. NOT a PR description, changelog, commit message, README, docs, or article — structure and length don't make it a posting. Set jobDescriptionUsable to false if too short or unrelated.
- If EITHER flag is false: set inputCheck.note naming every unusable input and what to re-upload, return empty arrays for all results, and STOP. Never fabricate analysis from unusable input.

STEP 2 — Only if both inputs pass, analyze:
- Judge ONLY against this JD. Never invent requirements it doesn't state. Every point relevant to THIS role — no generic praise or advice.
- Respect the JD's own priorities. If the JD explicitly says it values one thing over another (e.g. learning rate and growth over current seniority, or potential over years of experience), do NOT flag the de-emphasized thing as a gap or suggestion. Weight everything by what the JD actually asks for.
- Reward evidence, not adjectives: a strength counts only if backed by a concrete project, metric, or named tool.
- For suggestions, coach bullets toward XYZ format ("Accomplished X, measured by Y, by doing Z"). When you quote the weak wording, quote the resume bullet IN FULL and verbatim — never shorten it to a fragment that makes the bullet look weaker or emptier than it really is. If the original already includes the details, acknowledge them and refine; do not present existing content as missing. If a bullet is genuinely too long to quote whole, elide the middle with "[...]" while keeping the start and end intact (e.g. "Led the payments rework [...] cutting checkout latency by 40%") — never clip the end off and never drop the details that show the bullet's real substance.
- Keywords: real, specific skills/tools/technologies/certifications named in the JD that a recruiter or ATS would scan for, and that are genuinely absent from the resume. Each must be a coherent term that stands on its own and clearly supports a JD requirement — no soft-skill filler, no vague phrases, no words stitched together that no recruiter would search.
- One short standalone sentence per item. Fewer sharper points beat long lists. Empty array if none apply.

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
    const { apiKey } = await getConfig();

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
