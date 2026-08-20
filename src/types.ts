// Package Info
export interface PackageInfo {
  name: string;
  description: string;
  author: string;
  license: string;
}

// File Option
export interface FileOption {
  value: string;
  label: string;
}

// Config
export interface ConfigOptions {
  apiKeyInfo?: boolean;
  setApiKey?: string;
  showConfig?: boolean;
  resetConfig?: boolean;
}

export interface Config {
  apiKey?: string;
  model?: string;
}

// Models
export interface ModelsOptions {
  listModels?: boolean;
  setModel?: string;
  resetModel?: boolean;
}

// History
type InputCheck = {
  resumeUsable: boolean;
  jobDescriptionUsable: boolean;
  note: string;
};

type HistoryResult = {
  score: number;
  strengths: string[];
  suggestions: string[];
  gaps: string[];
  missingKeywords: string[];
};

export type HistoryRun = {
  id: number;
  filePath: string;
  date: string;
  role: string;
  company: string;
  inputCheck: InputCheck;
  results: HistoryResult;
};

export interface History {
  runs: HistoryRun[];
}
