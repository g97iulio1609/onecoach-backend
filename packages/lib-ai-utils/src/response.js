/**
 * Response Parsing Utilities
 *
 * Utilities for parsing and extracting data from AI responses.
 */
/**
 * Extract and parse JSON from text that may contain markdown code blocks
 *
 * @param text - Text containing JSON (possibly in markdown code blocks)
 * @returns Parsed JSON object or null if parsing fails
 */
export function extractAndParseJson(text) {
    if (!text || typeof text !== 'string') {
        return null;
    }
    // Try to extract from markdown code blocks first
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch?.[1]) {
        try {
            return JSON.parse(codeBlockMatch[1].trim());
        }
        catch {
            // Continue to try parsing the whole text
        }
    }
    // Try parsing the whole text
    try {
        return JSON.parse(text.trim());
    }
    catch {
        return null;
    }
}
/**
 * Clean and normalize JSON string
 */
export function cleanJsonString(text) {
    return text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
}
