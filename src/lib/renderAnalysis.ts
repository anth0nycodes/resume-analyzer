import chalk from "chalk";
import { basename } from "node:path";
import type { z } from "zod";
import type { ResumeAnalysisSchema } from "./schema.js";

// filePath is stored per history run, not returned by the model.
type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema> & {
  filePath?: string;
};

// Clamp to a readable measure; reflow to the terminal when it's narrower.
function termWidth() {
  const cols = process.stdout.columns ?? 80;
  return Math.max(40, Math.min(cols, 100));
}

// Greedy word-wrap. `indent` pads every line; `hang` extra-pads continuations.
export function wrap(text: string, indent: number, hang: number) {
  const width = termWidth();
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const pad = lines.length === 0 ? indent : indent + hang;
    if (line && pad + line.length + 1 + word.length > width) {
      lines.push(" ".repeat(pad) + line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) {
    const pad = lines.length === 0 ? indent : indent + hang;
    lines.push(" ".repeat(pad) + line);
  }
  return lines.join("\n");
}

function section(
  header: string,
  items: string[],
  emptyText: string,
  bullet: string,
) {
  console.log(header);
  if (items.length === 0) {
    console.log(chalk.dim(wrap(emptyText, 2, 0)));
  } else {
    for (const item of items) {
      const wrapped = wrap(item, 4, 0);
      console.log(
        `  ${bullet} ${wrapped.slice(4)}${item !== items[items.length - 1] ? "\n" : ""}`,
      );
    }
  }
  console.log();
}

// Lay keywords out as wrapped chips instead of a single overflowing line.
function keywordChips(keywords: string[]) {
  console.log(chalk.cyan.bold("🔑  Missing Keywords"));
  if (keywords.length === 0) {
    console.log(chalk.dim("  No missing keywords identified."));
    console.log();
    return;
  }
  const width = termWidth();
  const indent = 2;
  let line = " ".repeat(indent);
  let visibleLen = indent; // track plain-text width; chip ANSI codes are invisible
  for (const kw of keywords) {
    const chipWidth = kw.length + 3; // ` ${kw} ` plus trailing space
    if (visibleLen > indent && visibleLen + chipWidth > width) {
      console.log(line);
      line = " ".repeat(indent);
      visibleLen = indent;
    }
    line += `${chalk.bgCyan.black(` ${kw} `)} `;
    visibleLen += chipWidth;
  }
  if (visibleLen > indent) console.log(line);
  console.log();
}

function renderFileName(filePath?: string) {
  if (!filePath) return;
  console.log(`📄  ${chalk.bold(basename(filePath))}`);
}

// Bucket the score so the number carries a verdict, not just a color.
function scoreVerdict(score: number) {
  if (score >= 80) return { color: chalk.green, label: "Strong match" };
  if (score >= 60) return { color: chalk.yellow, label: "Partial match" };
  return { color: chalk.red, label: "Weak match" };
}

function renderScore(score: number) {
  const rounded = Math.round(score);
  const { color, label } = scoreVerdict(rounded);
  const barWidth = 20;
  const filled = Math.round((rounded / 100) * barWidth);
  const bar = color("█".repeat(filled)) + chalk.dim("░".repeat(barWidth - filled));

  console.log(
    `🎯  ${chalk.bold("Overall Score")}  ${color.bold(`${rounded}/100`)}  ${bar}  ${chalk.dim(label)}`,
  );
  console.log();
}

function renderInputWarning(inputCheck: ResumeAnalysis["inputCheck"]) {
  const problems: string[] = [];
  if (!inputCheck.resumeUsable) problems.push("resume");
  if (!inputCheck.jobDescriptionUsable) problems.push("job description");

  console.log(chalk.yellow.bold("⚠️  Couldn't analyze"));
  console.log(
    chalk.dim(
      wrap(`Problem with the ${problems.join(" and ")} you provided.`, 2, 0),
    ),
  );
  if (inputCheck.note) console.log(wrap(inputCheck.note, 2, 0));
  console.log();
}

export function renderAnalysis(analysis: ResumeAnalysis) {
  const { inputCheck, results, filePath } = analysis;

  if (!inputCheck.resumeUsable || !inputCheck.jobDescriptionUsable) {
    renderFileName(filePath);
    renderInputWarning(inputCheck);
    return;
  }

  renderFileName(filePath);
  renderScore(results.score);
  section(
    chalk.green.bold("✅  Strengths"),
    results.strengths,
    "No matched strengths surfaced for this job description.",
    chalk.green("●"),
  );
  section(
    chalk.yellow.bold("🔧  Suggestions"),
    results.suggestions,
    "No edits suggested for this resume.",
    chalk.yellow("●"),
  );
  section(
    chalk.red.bold("⚠️  Gaps"),
    results.gaps,
    "No gaps identified against this job description.",
    chalk.red("●"),
  );
  keywordChips(results.missingKeywords);
}
