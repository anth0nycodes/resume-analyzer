import chalk from "chalk";

export function printApiKeyInfo() {
  console.log(chalk.bold.blueBright("\nHow to get an OpenAI API key 🔑\n"));

  console.log(chalk.bold.cyan("1. Log in to the developer platform"));
  console.log(
    `   Go to ${chalk.underline("https://platform.openai.com")} (${chalk.yellow("not")} your ChatGPT settings — the API lives on a separate platform).`,
  );
  console.log("   Sign in with your OpenAI account, or sign up.\n");

  console.log(chalk.bold.cyan("2. Open the API keys section"));
  console.log(
    `   In the left sidebar, click ${chalk.bold("API keys")} (key icon).\n`,
  );

  console.log(chalk.bold.cyan("3. Create a secret key"));
  console.log(`   Click ${chalk.green("Create new secret key")}.`);
  console.log('   Optionally name it (e.g. "resume-analyzer") to track usage.');
  console.log(
    `   Set permissions to ${chalk.bold("All")} (${chalk.yellow("Read-only")} can't make requests).\n`,
  );

  console.log(chalk.bold.cyan("4. Copy and save it now"));
  console.log(
    `   The key (starts with ${chalk.gray("sk-...")}) shows ${chalk.bold("only once")}.`,
  );
  console.log(
    `   ${chalk.red("Copy it immediately")} and store it somewhere safe (password manager or .env).\n`,
  );

  console.log(chalk.bold.yellow("⚠️  Add credits before it works"));
  console.log(
    "   A key does nothing without billing — even with ChatGPT Plus.",
  );
  console.log(
    `   Go to ${chalk.bold("Settings → Billing")}, click ${chalk.green("Add funds")}, and preload at least ${chalk.bold("$5.00")}.\n`,
  );

  console.log(chalk.bold.cyan("5. Save it to Resume Analyzer"));
  console.log(
    `   Run ${chalk.cyan("resume-analyzer config --sak <api-key>")} / ${chalk.cyan("resume-analyzer config --set-api-key <api-key>")} to store it.\n`,
  );
}
