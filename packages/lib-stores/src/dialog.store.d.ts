/**
 * Dialog Store
 *
 * Manages dialog state for cross-platform dialogs
 * Replaces DialogContext with Zustand store
 * Supports alert, confirm, prompt, info, success, warning, error dialogs
 */
/**
 * Dialog type
 */
export type DialogType = 'alert' | 'confirm' | 'prompt' | 'info' | 'success' | 'warning' | 'error';
/**
 * Dialog options
 */
export interface DialogOptions {
    type?: DialogType;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    defaultValue?: string;
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    closeOnBackdropClick?: boolean;
}
/**
 * Dialog state
 */
export interface DialogState extends DialogOptions {
    isOpen: boolean;
    resolve?: (value: boolean | string | null) => void;
    reject?: () => void;
    inputValue?: string;
}
/**
 * Dialog actions interface
 */
export interface DialogActions {
    showDialog: (options: DialogOptions) => Promise<boolean | string | null>;
    alert: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel'>) => Promise<void>;
    confirm: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel' | 'cancelLabel'>) => Promise<boolean>;
    prompt: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel' | 'cancelLabel' | 'defaultValue' | 'placeholder'>) => Promise<string | null>;
    info: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel'>) => Promise<void>;
    success: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel'>) => Promise<void>;
    warning: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel' | 'cancelLabel'>) => Promise<void>;
    error: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel'>) => Promise<void>;
    closeDialog: () => void;
    setInputValue: (value: string) => void;
}
/**
 * Combined store type
 */
export type DialogStore = {
    dialogState: DialogState;
} & DialogActions;
/**
 * Dialog Store
 */
export declare const useDialogStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<DialogStore>, "setState" | "devtools"> & {
    setState(partial: DialogStore | Partial<DialogStore> | ((state: DialogStore) => DialogStore | Partial<DialogStore>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: DialogStore | ((state: DialogStore) => DialogStore), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}>;
/**
 * Hook to use dialog store
 * Compatible with useDialog from Next.js context
 */
export declare const useDialog: () => {
    showDialog: (options: DialogOptions) => Promise<boolean | string | null>;
    alert: (message: string, options?: Pick<DialogOptions, "title" | "confirmLabel">) => Promise<void>;
    confirm: (message: string, options?: Pick<DialogOptions, "title" | "confirmLabel" | "cancelLabel">) => Promise<boolean>;
    prompt: (message: string, options?: Pick<DialogOptions, "title" | "confirmLabel" | "cancelLabel" | "defaultValue" | "placeholder">) => Promise<string | null>;
    info: (message: string, options?: Pick<DialogOptions, "title" | "confirmLabel">) => Promise<void>;
    success: (message: string, options?: Pick<DialogOptions, "title" | "confirmLabel">) => Promise<void>;
    warning: (message: string, options?: Pick<DialogOptions, "title" | "confirmLabel" | "cancelLabel">) => Promise<void>;
    error: (message: string, options?: Pick<DialogOptions, "title" | "confirmLabel">) => Promise<void>;
};
/**
 * Hook to get dialog state (for rendering Dialog component)
 */
export declare const useDialogState: () => {
    dialogState: DialogState;
    handleConfirm: () => void;
    handleCancel: () => void;
    setInputValue: (value: string) => void;
};
//# sourceMappingURL=dialog.store.d.ts.map