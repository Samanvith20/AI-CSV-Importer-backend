import { PromptBuilder } from '../prompts/PromptBuilder.js';
import { GeminiProvider } from '../providers/GeminiProvider.js';
import { CRMResponse } from '../types/crm.types.js';

/**
 * Responsible strictly for semantic mapping via Gemini 2.5 Pro.

 */
export class AiService {
  public static async mapToCrmSchema(csvBatch: any[]): Promise<CRMResponse> {
    const systemPrompt = PromptBuilder.buildSystemPrompt();
    const userPrompt = PromptBuilder.buildUserPrompt(csvBatch);

    const rawResponse = await GeminiProvider.generateContent(systemPrompt, userPrompt);

    // Remove markdown fences like ```json and ```
    let cleanResponse = rawResponse.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.substring(7);
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.substring(3);
    }
    if (cleanResponse.endsWith('```')) {
      cleanResponse = cleanResponse.slice(0, -3);
    }
    cleanResponse = cleanResponse.trim();

    try {
      const parsed = JSON.parse(cleanResponse);
      return parsed as CRMResponse;
    } catch (error) {
      throw new Error(
        `Failed to parse Gemini response as JSON: ${(error as Error).message}\nRaw Output: ${cleanResponse}`,
      );
    }
  }
}
