import chalk from "chalk";
import { AVAILABLE_MODELS } from "../constants.js";

export function printModels(currentModel: string) {
  console.log(chalk.yellow("Available models:\n"));
  for (const { value, hint } of AVAILABLE_MODELS) {
    const isCurrent = value === currentModel;
    const marker = isCurrent ? chalk.green("●") : chalk.dim("○");
    const name = isCurrent ? chalk.green.bold(value) : value;
    console.log(`  ${marker} ${name} ${chalk.dim(`— ${hint}`)}`);
  }
  console.log(`\nCurrent default: ${chalk.cyan(currentModel)}`);
}
