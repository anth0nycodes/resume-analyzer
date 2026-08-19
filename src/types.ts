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
}

// History
export interface HistoryOptions {
  id: string;
}

type InputCheck = {
  resumeUsable: boolean;
  jobDescriptionUsable: boolean;
  note: string;
};

type HistoryResult = {
  strengths: string[];
  suggestions: string[];
  gaps: string[];
  missingKeywords: string[];
};

export type HistoryRun = {
  id: number;
  date: string;
  role: string;
  company: string;
  inputCheck: InputCheck;
  results: HistoryResult;
};

export interface History {
  runs: HistoryRun[];
}
