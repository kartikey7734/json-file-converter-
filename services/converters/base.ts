import { Platform, ConversionResult } from '../../types';

export interface AIConverter {
  convert(jsonContent: string, targetPlatform: Platform): Promise<ConversionResult>;
}
