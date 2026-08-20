# Contributing to resume-analyzer

Thanks for your interest in contributing! This document covers how to set up the project, make changes, and submit them.

## Getting Started

This project uses [pnpm](https://pnpm.io) as its package manager.

1. Fork the repository and clone your fork:

   ```bash
   git clone https://github.com/<your-username>/resume-analyzer.git
   cd resume-analyzer
   ```

2. Add the original repository as an `upstream` remote so you can keep your fork in sync:

   ```bash
   git remote add upstream https://github.com/anth0nycodes/resume-analyzer.git
   ```

   To pull in the latest changes later:

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Run the CLI locally in dev mode:

   ```bash
   pnpm dev -h
   ```

## Development

Useful scripts:

| Script       | Description                                  |
| ------------ | -------------------------------------------- |
| `pnpm dev`   | Run the CLI from source with `tsx`           |
| `pnpm build` | Compile TypeScript to `dist/`                |
| `pnpm start` | Run the compiled output                      |
| `pnpm check` | Type-check without emitting (`tsc --noEmit`) |

Before opening a PR, make sure the project type-checks:

```bash
pnpm check
```

### Running an analysis locally

`pnpm dev analyze` hits the real OpenAI API with the key stored in `~/.resume-analyzer/config.json`, so each run costs money. A few things worth knowing:

- Config and history live in `~/.resume-analyzer/` (`config.json` and `history.json`). Delete `history.json` to start from a clean run list.
- Use a cheaper model while iterating: e.g. `pnpm dev models --sm gpt-5.6-luna`.
- **Never commit an API key**, a real resume, or config/history contents — history entries hold resume file paths and analysis output. Redact them before pasting into an issue or PR.

### Project layout

```
src/
├── index.ts          # Commander entry point — wires up commands
├── commands/         # One file per subcommand (analyze, config, history, models)
├── lib/              # Analysis generation, schema, and terminal rendering
├── messages/         # Printed help/info output
├── constants.ts      # Supported file types + available models
├── helpers.ts        # Config, history, file selection, shared utilities
└── types.ts          # Shared types
```

Supported models are hardcoded in `src/constants.ts`. When adding one, verify it exists in the OpenAI models list and supports structured output, then place it in the list ordered most to least capable.

## Making Changes

1. Create a branch off `main`:

   ```bash
   git checkout -b your-name/feature-name
   ```

2. Make your changes. Keep them focused — one logical change per PR.

3. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).

4. Push your branch and open a pull request against `main`. Fill out the PR template.

## Reporting Bugs

Open a [bug report](https://github.com/anth0nycodes/resume-analyzer/issues/new?template=bug_report.md) and include steps to reproduce, expected vs. actual behavior, and your environment details.

## Code of Conduct

Be respectful and constructive. Keep discussions on-topic and welcoming to newcomers.
