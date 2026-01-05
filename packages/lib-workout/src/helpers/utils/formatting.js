/**
 * Formatting Utilities
 *
 * Utility functions per formattazione testo
 */
/**
 * Formatta una label muscolo in Title Case
 */
export function formatMuscleLabel(value) {
    const trimmed = value.trim();
    if (!trimmed) {
        return '';
    }
    return trimmed
        .split(/\s+|_/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
/**
 * Converte una stringa in Title Case
 */
export function toTitleCase(value) {
    return value
        .split(/\s+|_|-/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
}
