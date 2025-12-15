/**
 * Global Dialog Utilities
 *
 * Provides global functions to replace window.alert, window.confirm, window.prompt
 * These functions use Zustand store directly (can be called outside React components)
 *
 * Usage:
 *   import { dialog } from '@onecoach/lib-stores/utils/dialog-global';
 *   await dialog.alert('Message');
 *   const confirmed = await dialog.confirm('Are you sure?');
 *   const value = await dialog.prompt('Enter value:');
 */
export declare const dialog: {
    alert: (message: string, title?: string) => Promise<void>;
    confirm: (message: string, title?: string) => Promise<boolean>;
    prompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;
    info: (message: string, title?: string) => Promise<void>;
    success: (message: string, title?: string) => Promise<void>;
    warning: (message: string, title?: string) => Promise<void>;
    error: (message: string, title?: string) => Promise<void>;
};
//# sourceMappingURL=dialog-global.d.ts.map