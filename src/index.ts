import { program } from "commander";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getDeviceFiles, getErrorMessage, getFilePathByOS } from "./helpers.js";
import { autocomplete, cancel, intro, isCancel, select } from "@clack/prompts";
import chalk from "chalk";
import { homedir } from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf8"),
);

async function main() {
  program
    .name("Resume Analyzer")
    .version(packageJson.version)
    .description(packageJson.description);

  program.parse();

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
}

try {
  await main();
} catch (error) {
  const errorMessage = getErrorMessage(error);
  console.error("Error occured in main:", errorMessage);
  process.exit(1);
}
