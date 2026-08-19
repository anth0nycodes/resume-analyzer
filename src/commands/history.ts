import { HistoryOptions, HistoryRun } from "../types.js";
import { getHistory } from "../helpers.js";
import chalk from "chalk";
import { isCancel, cancel, select } from "@clack/prompts";
import { renderAnalysis } from "../lib/renderAnalysis.js";

function getHistoryRunLabel(run: HistoryRun) {
  const { resumeUsable, jobDescriptionUsable } = run.inputCheck;
  if (!resumeUsable || !jobDescriptionUsable) {
    const unreadable = [
      !resumeUsable && "resume",
      !jobDescriptionUsable && "job description",
    ]
      .filter(Boolean)
      .join(" and ");
    return `${chalk.dim(`${run.id}. Skipped — couldn't read the ${unreadable} • [${run.date}]`)}`;
  }
  return `${run.id}. ${run.role} ${run.company.length > 0 ? `at ${run.company} •` : "•"} [${run.date}]`;
}

export async function history(options: HistoryOptions) {
  if (options.id) {
    // pass for now
  }

  const historyJSON = await getHistory();
  const historyRuns = historyJSON.runs || [];
  if (historyRuns.length === 0) {
    console.log(
      `${chalk.yellow("No analyses yet.")} Run ${chalk.cyan("resume-analyzer analyze")} to create your first one.`,
    );
    return;
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
    console.log("Selected run not found.");
    process.exit();
  }

  const selectedRunLabel = getHistoryRunLabel(selectedRun);
  console.log(selectedRunLabel);
  renderAnalysis(selectedRun);
}
