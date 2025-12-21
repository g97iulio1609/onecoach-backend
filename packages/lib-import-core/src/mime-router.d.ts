import type { MimeRouterHandlers, MimeHandler } from './types';
export declare function createMimeRouter<TParsed>(handlers: MimeRouterHandlers<TParsed>): MimeHandler<TParsed>;
