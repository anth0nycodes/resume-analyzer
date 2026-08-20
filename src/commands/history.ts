import { HistoryRun } from "../types.js";
import { getHistory } from "../helpers.js";
import chalk from "chalk";
import { isCancel, cancel, select } from "@clack/prompts";
import { renderAnalysis, wrap } from "../lib/renderAnalysis.js";

function getHistoryRunLabel(run: HistoryRun) {
  const { resumeUsable, jobDescriptionUsable } = run.inputCheck;
  if (!resumeUsable || !jobDescriptionUsable) {
    const unusable = [
      !resumeUsable && "resume",
      !jobDescriptionUsable && "job description",
    ]
      .filter(Boolean)
      .join(" and ");
    return `${chalk.dim(`${run.id}. Skipped — unusable ${unusable} • [${run.date}]`)}`;
  }
  return `${run.id}. ${run.role} ${run.company.length > 0 ? `at ${run.company} •` : "•"} [${run.date}]`;
}

function renderRunDetails(run: HistoryRun) {
  const { resumeUsable, jobDescriptionUsable, note } = run.inputCheck;
  console.log(getHistoryRunLabel(run));

  if (!resumeUsable || !jobDescriptionUsable) {
    console.log(wrap(note, 2, 0));
    console.log();
    console.log(wrap(`Re-run ${chalk.cyan("resume-analyzer analyze")}.`, 2, 0));
    return;
  }

  renderAnalysis(run);
}

export async function history(runId?: string) {
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

  const historyRunOptions = historyRuns.map((run) => {
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
