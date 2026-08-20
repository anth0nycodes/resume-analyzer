#!/usr/bin/env node

import { program } from "commander";
import { fail, getPackageJson } from "./helpers.js";
import chalk from "chalk";
import { analyze } from "./commands/analyze.js";
import { printProjectInfo } from "./messages/projectInfo.js";
import { config } from "./commands/config.js";
import { history } from "./commands/history.js";
import { models } from "./commands/models.js";

const packageJson = await getPackageJson();

async function main() {
  program
    .name("Resume Analyzer")
    .version(packageJson.version)
    .description(packageJson.description);

  program
    .command("analyze")
    .description(
      `Analyze a resume file. Note: only ${chalk.yellow("PDF")} and ${chalk.yellow("DOCX")} files are supported.`,
    )
    .action(analyze);

  program
    .command("history")
    .description("View your analysis history")
    .argument("[run-id]", "ID of a specific run to view details for")
    .action(history);

  program
    .command("models")
    .description(
      "Choose the default OpenAI model used for analyses (interactive when no option is passed)",
    )
    .option("--lm, --list-models", "list the supported models")
    .option("--sm, --set-model <model>", "set your default model")
    .option("--rm, --reset-model", "reset your default model")
    .action(models);

  program
    .command("config")
    .description("Manage your Resume Analyzer configuration")
    .option("--aki, --api-key-info", "show how to obtain an API key")
    .option("--sak, --set-api-key <api-key>", "set your API key")
    .option("--sc, --show-config", "displays your current config")
    .option("--rc, --reset-config", "resets your current config")
    .action(config);

  if (process.argv.slice(2).length === 0) {
    printProjectInfo(packageJson);
    return;
  }

  await program.parseAsync();
}

try {
  await main();
} catch (error) {
  fail("Error occurred in main", error);
}
