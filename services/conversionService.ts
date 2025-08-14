import { Platform, ConversionResult, Settings } from '../types';
import { GeminiConverter } from './converters/geminiConverter';
import { AIConverter } from './converters/base';

/**
 * Factory function to create a converter instance based on user settings.
 */
const createConverter = (settings: Settings): AIConverter | null => {
    switch (settings.provider) {
        case 'gemini':
            return new GeminiConverter(settings.apiKey);
        // In the future, other providers like OpenAI could be added here.
        // case 'openai':
        //     return new OpenAIConverter(settings.apiKey);
        default:
            console.error(`Unknown AI provider: ${settings.provider}`);
            return null;
    }
};

/**
 * The main function to convert a workflow.
 * It uses a dynamically created AI converter based on the provided settings.
 */
export const convertWorkflow = async (
  jsonContent: string,
  targetPlatform: Platform,
  settings: Settings
): Promise<ConversionResult> => {
  const converter = createConverter(settings);

  if (!converter) {
    return {
      json: null,
      error: 'AI provider is not configured. Please check your settings.',
    };
  }

  return converter.convert(jsonContent, targetPlatform);
};