/**
 * JSON Parser Utility
 *
 * Utility functions for parsing JSON from AI responses
 */
import { extractAndParseJson } from './response';
/**
 * Parse JSON response from AI text output
 * Extracts JSON from markdown code blocks or plain JSON
 *
 * @param text - Text containing JSON
 * @returns Parsed JSON object or null if parsing fails
 */
export function parseJsonResponse(text) {
    return extractAndParseJson(text);
}
