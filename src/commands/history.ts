import { HistoryRun } from "../types.js";
import { fileExists, getHistory, HISTORY_FILE } from "../helpers.js";
import chalk from "chalk";
import { isCancel, cancel, select } from "@clack/prompts";
import { basename } from "node:path";
import { renderAnalysis, wrap } from "../lib/renderAnalysis.js";

// Same thresholds as the score bar in renderAnalysis.
function scoreTag(score: number) {
  const rounded = Math.round(score);
  const color =
    rounded >= 80 ? chalk.green : rounded >= 60 ? chalk.yellow : chalk.red;
  return color(`${rounded}/100`);
}

// `summary` adds file + score for the picker list; the detail view leaves both
// to renderAnalysis so they aren't printed twice.
function getHistoryRunLabel(run: HistoryRun, summary = true) {
  const { resumeUsable, jobDescriptionUsable } = run.inputCheck;
  const file = run.filePath ? `${basename(run.filePath)} • ` : "";
  if (!resumeUsable || !jobDescriptionUsable) {
    const unusable = [
      !resumeUsable && "resume",
      !jobDescriptionUsable && "job description",
    ]
      .filter(Boolean)
      .join(" and ");
    return `${chalk.dim(`${run.id}. Skipped — unusable ${unusable} • ${file}[${run.date}]`)}`;
  }
  const parts = summary ? `${file}${scoreTag(run.results.score)} • ` : "";
  return `${run.id}. ${run.role} ${run.company.length > 0 ? `at ${run.company} •` : "•"} ${parts}[${run.date}]`;
}

function renderRunDetails(run: HistoryRun) {
  const { resumeUsable, jobDescriptionUsable, note } = run.inputCheck;
  console.log(getHistoryRunLabel(run, false));

  if (!resumeUsable || !jobDescriptionUsable) {
    console.log(wrap(note, 2, 0));
    console.log();
    console.log(wrap(`Re-run ${chalk.cyan("resume-analyzer analyze")}.`, 2, 0));
    return;
  }

  renderAnalysis(run);
}

export async function history(runId?: string) {
  if (!(await fileExists(HISTORY_FILE))) {
    console.log(
      `${chalk.yellow("No analyses yet.")} Run ${chalk.cyan("resume-analyzer analyze")} to create your first one.`,
    );
    process.exit();
  }
  const historyJSON = await getHistory();
  const historyRuns = historyJSON.runs || [];
  if (historyRuns.length === 0) {
    console.log(
      `${chalk.yellow("No analyses yet.")} Run ${chalk.cyan("resume-analyzer analyze")} to create your first one.`,
    );
    process.exit();
  }

  if (runId) {
    if (!/^\d+$/.test(runId)) {
      console.log(chalk.yellow("Please provide a valid run ID."));
      process.exit();
    }
    const selectedRun = historyRuns.find((run) => run.id === Number(runId));
    if (!selectedRun) {
      console.log(chalk.yellow(`No run found with ID ${runId}.`));
      process.exit();
    }
    renderRunDetails(selectedRun);
    process.exit();
  }

  // Latest first. Dates are day-granular, so same-day runs fall back to id
  // (which increments per run) to keep the newest on top.
  const sortedRuns = [...historyRuns].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date) || b.id - a.id,
  );
  const historyRunOptions = sortedRuns.map((run) => {
    const { resumeUsable, jobDescriptionUsable } = run.inputCheck;
    return {
      value: run.id,
      disabled: !resumeUsable || !jobDescriptionUsable,
      label: getHistoryRunLabel(run),
    };
  });

  const runOption = await select({
    message: "Select a run to view more details",
    options: historyRunOptions,
  });

  if (isCancel(runOption)) {
    cancel("Operation cancelled. Exiting…");
    process.exit();
  }

  const selectedRun = historyRuns.find((run) => run.id === runOption);
  if (!selectedRun) {
    console.log(chalk.yellow("Selected run not found."));
    process.exit();
  }

  renderRunDetails(selectedRun);
  process.exit();
}
