export const SUPPORTED_FILE_TYPES = [".pdf", ".docx"];

// Hardcoded on purpose: every entry is verified against the OpenAI models list
// and supports the structured output the analysis relies on. Reasoning/codex
// and dated snapshot IDs are left out.
export const AVAILABLE_MODELS = [
  { value: "gpt-5.6-terra", label: "gpt-5.6-terra", hint: "newest generation" },
  { value: "gpt-5.6-sol", label: "gpt-5.6-sol", hint: "newest generation" },
  { value: "gpt-5.6-luna", label: "gpt-5.6-luna", hint: "newest generation" },
  { value: "gpt-5.5", label: "gpt-5.5", hint: "previous flagship" },
  { value: "gpt-5.4", label: "gpt-5.4", hint: "most capable of the 5.4 line" },
  {
    value: "gpt-5.4-mini",
    label: "gpt-5.4-mini",
    hint: "default — fast and cheap",
  },
] as const;

export const DEFAULT_MODEL = "gpt-5.4-mini";
