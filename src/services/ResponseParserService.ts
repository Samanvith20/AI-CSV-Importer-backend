export class ResponseParserService {
  /**
   * Removes markdown code fences if present and extracts valid JSON.
   * Throws meaningful errors if JSON is malformed.
   */
  public static parse(input: any): any {
    if (typeof input !== 'string') {
      return input;
    }

    let cleanResponse = input.trim();

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
      return JSON.parse(cleanResponse);
    } catch (error) {
      throw new Error(
        `Failed to parse response as JSON: ${(error as Error).message}\nRaw Output: ${cleanResponse}`,
      );
    }
  }
}
