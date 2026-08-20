# 🤖 resume-analyzer

An AI-powered CLI that analyzes your resume against a job description and scores how well they match.

<p align="center">
  <img alt="GitHub Stars" src="https://img.shields.io/github/stars/anth0nycodes/resume-analyzer?style=plastic">
  <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40anth0nycodes%2Fresume-analyzer?style=plastic">
</p>

## Installation

```bash
npm install -g @anth0nycodes/resume-analyzer
```

## Setup

The CLI calls the OpenAI API with **your own** API key, so you need one before running an analysis.

1. Get an API key — run `resume-analyzer config --aki` for step-by-step instructions.
2. Save it:

   ```bash
   resume-analyzer config --set-api-key <api-key>
   ```

3. (Optional) Pick a default model:

   ```bash
   resume-analyzer models
   ```

Your API key, default model, and analysis history live in `~/.resume-analyzer/`.

> [!NOTE]
> An OpenAI API key needs billing credits to work — a ChatGPT Plus subscription does **not** cover API usage.

## Usage

### Default

```bash
resume-analyzer
```

Shows basic information about the tool. Run `resume-analyzer -h` / `resume-analyzer --help` for additional information.

### Commands

#### Analyze a Resume

Run an analysis against a job description:

```bash
resume-analyzer analyze
```

The flow is interactive:

1. Pick your resume — via a native file dialog, or from a list of files in `Desktop/` and `Downloads/`.
2. Paste the job description into your `$EDITOR` (`$VISUAL`/`$EDITOR`, falling back to `vi` or `notepad`), then save and close.
3. The resume is converted to Markdown and sent to OpenAI along with the job description.

You get back a **score out of 100**, plus strengths, suggestions, gaps, and missing keywords — all judged against that specific posting. Every run is saved to your history.

> [!NOTE]
> Only `PDF` and `DOCX` resumes are supported.

#### View History

Browse past analyses in an interactive picker:

```bash
resume-analyzer history
```

Or jump straight to a run by its ID:

```bash
resume-analyzer history <run-id>
```

#### Manage Models

Pick the default model interactively:

```bash
resume-analyzer models
```

List the supported models (the current default is marked):

```bash
resume-analyzer models --lm
# or
resume-analyzer models --list-models
```

Set your default model:

```bash
resume-analyzer models --sm <model>
# or
resume-analyzer models --set-model <model>
```

Reset your default model:

```bash
resume-analyzer models --rm
# or
resume-analyzer models --reset-model
```

#### API Key Info

Show instructions on how to create an OpenAI API key:

```bash
resume-analyzer config --aki
# or
resume-analyzer config --api-key-info
```

#### Set API Key

Set your API key:

```bash
resume-analyzer config --sak <api-key>
# or
resume-analyzer config --set-api-key <api-key>
```

#### Show Config

Display your current configuration settings (contains API key):

```bash
resume-analyzer config --sc
# or
resume-analyzer config --show-config
```

#### Reset Config

Resets your current configuration settings (clears API key and default model):

```bash
resume-analyzer config --rc
# or
resume-analyzer config --reset-config
```

## Contributing

Contributions are welcome! Whether it's a bug fix, new feature, or docs improvement, see [CONTRIBUTING.md](./CONTRIBUTING.md) for how to get started.

Found a bug? [Open a bug report](https://github.com/anth0nycodes/resume-analyzer/issues/new?template=bug_report.md).
