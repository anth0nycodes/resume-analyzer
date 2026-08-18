import { program } from "commander";
import { fail, getPackageJson } from "./helpers.js";
import chalk from "chalk";
import { analyzeResume } from "./commands/analyze.js";
import { printProjectInfo } from "./messages/projectInfo.js";
import { config } from "./commands/config.js";

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
    .action(async () => await analyzeResume());

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

  program.parseAsync();
}

try {
  await main();
} catch (error) {
  fail("Error occurred in main", error);
}
