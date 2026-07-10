import { env } from '../config/env.js';

export class GeminiProvider {
  /**
   * Calls the Gemini API with the given system and user prompts.
   */
  public static async generateContent(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content ?? '';
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to communicate with Gemini API: ${(error as Error).message}`);
    }
  }
}
