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
