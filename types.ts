export type Platform = 'make' | 'n8n';

export interface ConversionResult {
  json: object | null;
  error: string | null;
}

export type AiProvider = 'gemini';

export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
  provider: AiProvider;
  apiKey: string | null;
  theme: Theme;
}

export interface User {
  email: string;
  isPro: boolean;
  conversionCount: number;
}

export interface DebugReport {
  generatedAt: string;
  users: { [email: string]: User };
  settings: Settings;
  environment: {
    userAgent: string;
  };
}