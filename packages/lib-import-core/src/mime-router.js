const SPREADSHEET_MIME_SNIPPETS = ['spreadsheet', 'excel', 'csv'];
export function createMimeRouter(handlers) {
    return async (content, mimeType) => {
        const normalized = (mimeType || '').toLowerCase();
        if (normalized.startsWith('image/') && handlers.image) {
            return handlers.image(content, mimeType);
        }
        if (normalized === 'application/pdf' && handlers.pdf) {
            return handlers.pdf(content, mimeType);
        }
        if (handlers.spreadsheet &&
            (normalized === 'text/csv' ||
                SPREADSHEET_MIME_SNIPPETS.some((s) => normalized.includes(s)) ||
                normalized === 'application/vnd.ms-excel' ||
                normalized === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
            return handlers.spreadsheet(content, mimeType);
        }
        if (handlers.document) {
            return handlers.document(content, mimeType);
        }
        if (handlers.fallback) {
            return handlers.fallback(content, mimeType);
        }
        throw new Error(`Unsupported MIME type: ${mimeType}`);
    };
}
