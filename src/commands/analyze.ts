import {
  fail,
  getDeviceFiles,
  getEditorInfo,
  getFilePathByOS,
  isSupportedFile,
} from "../helpers.js";
import { autocomplete, cancel, intro, isCancel, select } from "@clack/prompts";
import { editor } from "@inquirer/prompts";
import { homedir } from "node:os";
import { toMarkdown } from "@firecrawl/anydoc";
import chalk from "chalk";
import { join } from "node:path";
import { generateResumeAnalysis } from "../lib/generateResumeAnalysis.js";
import { renderAnalysis } from "../lib/renderAnalysis.js";

export async function analyze() {
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
      if (!isSupportedFile(selectedFilePath)) {
        throw new Error(
          "Only PDF and DOCX files are supported. Please select a valid file.",
        );
      }
      filePath = selectedFilePath;
      console.log(chalk.green(`Using: ${filePath}`));
    } catch (error) {
      fail("Error selecting file via nativeDialog", error);
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
      fail("Error selecting file via scanFolders", error);
    }
  }

  if (!filePath) {
    console.error(chalk.red("No file path selected. Exiting…"));
    process.exit(1);
  }

  let resumeMarkdown: string | null = null;
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
    resumeMarkdown = await toMarkdown(filePath);
  } catch (error) {
    fail("Error preparing resume and job description", error);
  }

  try {
    const resumeAnalysisResult = await generateResumeAnalysis(
      resumeMarkdown,
      jobDescriptionText,
      filePath,
    );
    console.log(chalk.blueBright("\nResume Analysis Result:\n"));
    renderAnalysis(resumeAnalysisResult);
  } catch (error) {
    fail("Error generating resume analysis", error);
  }
}
