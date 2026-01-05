import { z } from 'zod';
export const IMPORT_LIMITS = {
    MAX_FILES: 5,
    MAX_FILE_SIZE: 8 * 1024 * 1024,
    RATE_LIMIT_PER_HOUR: 30,
    DEFAULT_CREDIT_COST: 1,
};
export const SUPPORTED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/msword', // doc
    'application/vnd.oasis.opendocument.text', // odt
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'application/vnd.oasis.opendocument.spreadsheet', // ods
];
