import { cancel, isCancel, select } from "@clack/prompts";
import chalk from "chalk";
import { AVAILABLE_MODELS, DEFAULT_MODEL } from "../constants.js";
import { fail, getModel, isSupportedModel, setConfig } from "../helpers.js";
import { ModelsOptions } from "../types.js";

function printModels(currentModel: string) {
  console.log(chalk.yellow("Available models:\n"));
  for (const { value, hint } of AVAILABLE_MODELS) {
    const isCurrent = value === currentModel;
    const marker = isCurrent ? chalk.green("●") : chalk.dim("○");
    const name = isCurrent ? chalk.green.bold(value) : value;
    console.log(`  ${marker} ${name} ${chalk.dim(`— ${hint}`)}`);
  }
  console.log(`\nCurrent default: ${chalk.cyan(currentModel)}`);
}

async function saveModel(model: string) {
  await setConfig({ model });
  console.log(`${chalk.green("Default model set to")} ${chalk.cyan(model)}.`);
}

export async function models(options: ModelsOptions) {
  const currentModel = await getModel();

  if (options.listModels) {
    printModels(currentModel);
    process.exit();
  }

  if (options.setModel) {
    const model = options.setModel.trim();
    if (!isSupportedModel(model)) {
      console.log(
        `${chalk.yellow(`"${model}" is not a supported model.`)} Run ${chalk.cyan("resume-analyzer models --lm")} / ${chalk.cyan("resume-analyzer models --list-models")} to see the supported models.`,
      );
      process.exit(1);
    }
    try {
      await saveModel(model);
      process.exit();
    } catch (error) {
      fail("Error setting model", error);
    }
  }

  if (options.resetModel) {
    try {
      await saveModel(DEFAULT_MODEL);
      process.exit();
    } catch (error) {
      fail("Error resetting model", error);
    }
  }

  // No option passed — pick a model interactively.
  const selectedModel = await select({
    message: "Select the default model for your analyses",
    initialValue: currentModel,
    options: AVAILABLE_MODELS.map(({ value, label, hint }) => ({
      value,
      label:
        value === currentModel ? `${label} ${chalk.dim("(current)")}` : label,
      hint,
    })),
  });

  if (isCancel(selectedModel)) {
    cancel("Operation cancelled. Exiting…");
    process.exit();
  }

  if (selectedModel === currentModel) {
    console.log(`${chalk.cyan(currentModel)} is already your default model.`);
    process.exit();
  }

  try {
    await saveModel(selectedModel);
    process.exit();
  } catch (error) {
    fail("Error setting model", error);
  }
}
