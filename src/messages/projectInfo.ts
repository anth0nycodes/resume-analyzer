import chalk from "chalk";
import { PackageInfo } from "../types";

export function printProjectInfo(packageJson: PackageInfo) {
  console.log(chalk.bold.blueBright("\nResume Analyzer 🤖"));
  console.log(chalk.gray(`${packageJson.description}\n`));
  console.log(`${chalk.bold("Author:")}    ${chalk.cyan(packageJson.author)}`);
  console.log(
    `${chalk.bold("License:")}   ${chalk.magenta(packageJson.license)}`,
  );
  console.log(
    `${chalk.bold("Supports:")}  ${chalk.yellow("PDF")}, ${chalk.yellow("DOCX")}\n`,
  );
}
