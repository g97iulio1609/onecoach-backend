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
export declare function extractAndParseJson<T = unknown>(text: string): T | null;
/**
 * Clean and normalize JSON string
 */
export declare function cleanJsonString(text: string): string;
