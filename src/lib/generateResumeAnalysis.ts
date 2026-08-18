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
  HISTORY_FILE,
} from "../helpers.js";
import { ResumeAnalysisSchema } from "./schema.js";
import { mkdir, writeFile } from "node:fs/promises";

export async function generateResumeAnalysis(
  resumeMarkdown: string,
  jobDescription: string,
) {
  const SYSTEM_PROMPT = `You are a senior hiring manager and technical recruiter reviewing a resume against a specific job description.

Mindset:
- Recruiters scan a resume in ~6-10 seconds using an F-pattern: top of the page, left edge, then a quick sweep. Judge whether the most relevant, quantified wins are where that scan lands.
- Reward evidence, not adjectives. A strength counts only if backed by a concrete project, metric, or named tool.
- Coach bullets toward XYZ format: "Accomplished X, measured by Y, by doing Z." When suggesting an edit, quote the weak wording, then give the tightened version.

Rules:
- Judge ONLY against the provided job description. Never invent requirements the JD does not state.
- Every point must be relevant to THIS role. Drop generic advice and generic praise.
- Keywords must be real skills/tools/technologies from the JD that are genuinely relevant to the role and absent from the resume — no soft-skill filler, nothing unrelated.
- Be specific and evidence-based; quote resume/JD wording when it sharpens the point.
- Keep each item to one short, standalone sentence. Respect the field limits — fewer, sharper points beat long lists. Return an empty array if none apply.

Input check (do this first — judge each input INDEPENDENTLY):
- Resume: a resume describes ONE person's work history — contact line, roles, dates, bullet accomplishments. It is NOT a handbook, manual, policy doc, guide, article, job posting, or any other document. Length does not make it a resume; a long document that isn't one person's work history means inputCheck.resumeUsable is false. Also set false if it is empty, garbled, or the wrong document type. The resume is converted to Markdown for structure — judge its content, not the formatting; Markdown syntax is never a reason to mark it unusable or to lower the analysis.
- Job description: set inputCheck.jobDescriptionUsable false if it is missing, too short, or not a real posting.
- Set each flag true ONLY if that input passes its own test. Never let one input's verdict carry the other — a bad JD does not excuse skipping the resume check, and vice versa.
- If ANY flag is false, set inputCheck.note to name EVERY unusable input and what to re-upload for each, then return empty arrays for all results. Never fabricate analysis from unusable input.`;

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

    loader.start("Analyzing your resume against the job description...");
    const { text } = await generateText({
      model: openai("gpt-5.4-mini"),
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
    const historyRun = { id: historyRunId, ...parsedOutput };
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
