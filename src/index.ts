import { program } from "commander";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getErrorMessage } from "./helpers.js";
import chalk from "chalk";
import { analyzeResume } from "./commands/analyze.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf8"),
);

function printProjectInfo() {
  console.log(chalk.bold.blueBright(`\n${packageJson.name} 🤖`));
  console.log(chalk.gray(`${packageJson.description}\n`));
  console.log(`${chalk.bold("Author:")}    ${chalk.cyan(packageJson.author)}`);
  console.log(
    `${chalk.bold("License:")}   ${chalk.magenta(packageJson.license)}`,
  );
  console.log(
    `${chalk.bold("Supports:")}  ${chalk.yellow("PDF")}, ${chalk.yellow("DOCX")}\n`,
  );
}

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

  if (process.argv.slice(2).length === 0) {
    printProjectInfo();
    return;
  }

  await program.parseAsync();
}

try {
  await main();
} catch (error) {
  const errorMessage = getErrorMessage(error);
  console.error("Error occured in main:", errorMessage);
  process.exit(1);
}
