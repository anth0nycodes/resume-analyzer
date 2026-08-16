import {
  getDeviceFiles,
  getEditorInfo,
  getErrorMessage,
  getFilePathByOS,
} from "../helpers.js";
import { autocomplete, cancel, intro, isCancel, select } from "@clack/prompts";
import { editor } from "@inquirer/prompts";
import { homedir } from "node:os";
import { toMarkdown } from "@firecrawl/anydoc";
import chalk from "chalk";
import { join } from "node:path";

export async function analyzeResume() {
  intro(chalk.blueBright("Resume Analyzer 🤖\n"));

  let filePath: string | null = null;
  const fileSource = await select({
    message: "How do you want to select your resume?",
    options: [
      { value: "nativeDialog", label: "Browse… (open dialog)" },
      {
        value: "scanFolders",
        label: `Pick from ${chalk.yellow("Desktop/")} or ${chalk.yellow("Downloads/")}`,
      },
    ],
  });
  if (isCancel(fileSource)) {
    cancel("Operation cancelled. Exiting…");
    process.exit();
  }

  if (fileSource === "nativeDialog") {
    try {
      const selectedFilePath = await getFilePathByOS();
      if (!selectedFilePath)
        throw new Error("No file selected — did you cancel the dialog?");
      filePath = selectedFilePath;
      console.log(chalk.green(`Using: ${filePath}`));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error(chalk.red(`Error selecting file: ${errorMessage}`));
      process.exit(1);
    }
  } else if (fileSource === "scanFolders") {
    const desktopDir = join(homedir(), "Desktop");
    const downloadsDir = join(homedir(), "Downloads");
    try {
      const resumeFiles = await getDeviceFiles(desktopDir, downloadsDir);
      if (resumeFiles.length === 0) {
        console.log(
          chalk.yellow(
            `No PDF or DOCX files found in ${chalk.yellow("Desktop/")} or ${chalk.yellow("Downloads/")}.`,
          ),
        );
        process.exit();
      }
      const selectedFilePath = await autocomplete({
        message: "Select a resume:",
        placeholder: "Type to filter…",
        options: resumeFiles,
      });
      if (isCancel(selectedFilePath)) {
        cancel("Operation cancelled. Exiting…");
        process.exit();
      }
      filePath = String(selectedFilePath);
      console.log(chalk.green(`Using: ${filePath}`));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error(chalk.red(`Error selecting file: ${errorMessage}`));
      process.exit(1);
    }
  }

  if (!filePath) {
    console.error(chalk.red("No file path selected. Exiting…"));
    process.exit(1);
  }

  const resumeMarkdown = await toMarkdown(filePath);
  let jobDescriptionText: string | null = null;

  try {
    const { name: editorName, saveHint } = getEditorInfo();
    console.log(
      chalk.dim(
        `\nOpening ${chalk.cyan(editorName)}. Paste the job description, then ${saveHint}.`,
      ),
    );
    const jobDescription = await editor({
      message: "Paste the job description (opens your editor):",
      validate: (value) =>
        value.trim() !== "" || "Job description cannot be empty.",
    });
    jobDescriptionText = jobDescription.trim();
    console.log(chalk.blueBright("\nJob Description:\n"));
    console.log(chalk.white(jobDescriptionText));
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(chalk.red(`Error getting job description: ${errorMessage}`));
    process.exit(1);
  }
}
