import { Command } from "commander";
import { printApiKeyInfo } from "../messages/apiKeyInfo.js";
import { ConfigOptions } from "../types.js";
import {
  CONFIG_FILE,
  fileExists,
  getConfig,
  getErrorMessage,
  setConfig,
} from "../helpers.js";
import chalk from "chalk";

export async function config(options: ConfigOptions, command: Command) {
  if (options.apiKeyInfo) {
    printApiKeyInfo();
    return;
  }

  if (options.setApiKey) {
    const apiKey = options.setApiKey.trim();
    try {
      await setConfig({ apiKey });
      console.log(`${chalk.green("API key set successfully!")}`);
      process.exit();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error("Error setting API key:", errorMessage);
      process.exit(1);
    }
  }

  if (options.showConfig) {
    if (!(await fileExists(CONFIG_FILE))) {
      console.log(
        `${chalk.yellow("No config file found.")} No config to display. You can create a config by setting your API key with ${chalk.cyan("resume-analyzer config --sak <api-key>")} / ${chalk.cyan("resume-analyzer config --set-api-key <api-key>")}.`,
      );
      process.exit();
    }

    try {
      const config = await getConfig();
      const configString = JSON.stringify(config, null, 2);
      const isConfigEmpty = Object.keys(config).length === 0;
      if (isConfigEmpty) {
        console.log(
          `\n${chalk.yellow("Note:")} Your config file is empty. You can set your API key with ${chalk.cyan("resume-analyzer config --sak <api-key>")} / ${chalk.cyan("resume-analyzer config --set-api-key <api-key>")}.`,
        );
      }
      console.log(`${chalk.yellow("Your current config:\n")}${configString}`);
      process.exit();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error("Error reading config:", errorMessage);
      process.exit(1);
    }
  }

  if (options.resetConfig) {
    if (!(await fileExists(CONFIG_FILE))) {
      console.log(
        `${chalk.yellow("No config file found.")} Nothing to reset. You can create a config by setting your API key with ${chalk.cyan("resume-analyzer config --sak <api-key>")} / ${chalk.cyan("resume-analyzer config --set-api-key <api-key>")}.`,
      );
      process.exit();
    }

    try {
      await setConfig({});
      console.log(`${chalk.green("Config reset successfully!")}`);
      process.exit();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error("Error resetting config:", errorMessage);
      process.exit(1);
    }
  }

  // No option passed — show config command help.
  command.help();
}
