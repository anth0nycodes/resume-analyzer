import { program } from "commander";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { getErrorMessage } from "./helpers.js";
import { intro } from "@clack/prompts";
import chalk from "chalk";

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

  intro(chalk.blueBright("Resume Analyzer 🤖\n"));
}

try {
  await main();
} catch (error) {
  const errorMessage = getErrorMessage(error);
  console.error("Error occured in main:", errorMessage);
  process.exit(1);
}
