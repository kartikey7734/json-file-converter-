import { GoogleGenAI } from "@google/genai";
import { Platform, ConversionResult } from '../../types';
import { AIConverter } from './base';

const getMakeToN8nPrompt = (jsonContent: string): string => `
You are a world-class AI developer tool. Your purpose is to accurately convert automation workflow JSON files from Make.com (formerly Integromat) to n8n format. You must adhere to the schema and conventions of the n8n platform.

**Key Mappings:**
- Make.com 'modules' should be converted to n8n 'nodes'.
- 'id' and 'label' in modules should map to 'id' and 'name' in nodes.
- 'router' property in Make modules should map to n8n node 'type'. For example, a 'builtin.BasicTool' with a 'module' of 'json.parse' might become an n8n node of type 'n8n-nodes-base.json'. Be intelligent about the mapping.
- 'connections' in the Make blueprint should map to the 'connections' object in n8n, connecting the nodes correctly.
- 'parameters' in Make modules should be translated to 'parameters' in n8n nodes.

The output must be ONLY the raw JSON object, without any surrounding text, explanations, or markdown \`\`\`json fences.

Here is the Make.com JSON:
${jsonContent}
`;

const getN8nToMakePrompt = (jsonContent: string): string => `
You are a world-class AI developer tool. Your purpose is to accurately convert automation workflow JSON files from n8n to Make.com (formerly Integromat) format. You must adhere to the schema and conventions of the Make.com platform.

**Key Mappings:**
- n8n 'nodes' should be converted to Make.com 'modules' within a 'flow' array. There should be at least one flow element.
- 'id', 'name', and 'type' in n8n nodes should map to 'id', 'label', and 'router' in Make modules. For example, an n8n node of type 'n8n-nodes-base.start' might become a Make module with router 'builtin.trigger'. Be intelligent about the mapping.
- The n8n 'connections' object should be used to create the 'connections' array in the Make blueprint.
- 'parameters' in n8n nodes should be translated to 'parameters' in Make modules.
- Wrap the final output in a standard Make.com blueprint structure with 'name', 'flow', and 'metadata' keys.

The output must be ONLY the raw JSON object, without any surrounding text, explanations, or markdown \`\`\`json fences.

Here is the n8n JSON:
${jsonContent}
`;

export class GeminiConverter implements AIConverter {
    private ai: GoogleGenAI | null;
    private apiKey: string | null;

    constructor(apiKey: string | null) {
        this.apiKey = apiKey;
        if (this.apiKey) {
            this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        } else {
            this.ai = null;
        }
    }
    
    async convert(jsonContent: string, targetPlatform: Platform): Promise<ConversionResult> {
        if (!this.ai) {
            return {
                json: null,
                error: 'API key is not configured. Please add your API key in the settings.',
            };
        }

        try {
            const prompt =
              targetPlatform === 'n8n'
                ? getMakeToN8nPrompt(jsonContent)
                : getN8nToMakePrompt(jsonContent);
        
            const response = await this.ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            });
        
            let jsonStr = response.text.trim();
            // Fallback for cases where the model still includes fences
            const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
            const match = jsonStr.match(fenceRegex);
            if (match && match[2]) {
              jsonStr = match[2].trim();
            }
            
            const parsedJson = JSON.parse(jsonStr);
            return { json: parsedJson, error: null };
        
          } catch (error) {
            console.error('Gemini API Error:', error);
            const errorMessage =
              error instanceof Error ? error.message : 'An unknown error occurred.';
            return {
              json: null,
              error: `Failed to convert workflow. Reason: ${errorMessage}`,
            };
          }
    }
}