/**
 * Dialog Store
 *
 * Manages dialog state for cross-platform dialogs
 * Replaces DialogContext with Zustand store
 * Supports alert, confirm, prompt, info, success, warning, error dialogs
 */
'use client';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
/**
 * Initial dialog state
 */
const initialDialogState = {
    isOpen: false,
    message: '',
};
/**
 * Dialog Store
 */
export const useDialogStore = create()(devtools((set, get) => ({
    dialogState: initialDialogState,
    showDialog: (options) => {
        return new Promise((resolve, reject) => {
            set({
                dialogState: {
                    ...options,
                    isOpen: true,
                    resolve: (value) => {
                        set({ dialogState: initialDialogState });
                        resolve(value);
                    },
                    reject: () => {
                        set({ dialogState: initialDialogState });
                        reject();
                    },
                    inputValue: options.defaultValue || '',
                },
            });
        });
    },
    alert: (message, options) => {
        return get()
            .showDialog({ type: 'alert', message, ...options })
            .then(() => undefined);
    },
    confirm: (message, options) => {
        return get()
            .showDialog({ type: 'confirm', message, ...options })
            .then((result) => result === true);
    },
    prompt: (message, options) => {
        return get()
            .showDialog({
            type: 'prompt',
            message,
            ...options,
            placeholder: options?.placeholder || 'Enter a value...',
        })
            .then((result) => (result === null ? null : String(result)));
    },
    info: (message, options) => {
        return get()
            .showDialog({ type: 'info', message, ...options })
            .then(() => undefined);
    },
    success: (message, options) => {
        return get()
            .showDialog({ type: 'success', message, ...options })
            .then(() => undefined);
    },
    warning: (message, options) => {
        return get()
            .showDialog({ type: 'warning', message, ...options })
            .then(() => undefined);
    },
    error: (message, options) => {
        return get()
            .showDialog({ type: 'error', message, ...options })
            .then(() => undefined);
    },
    closeDialog: () => {
        const { dialogState } = get();
        if (dialogState.reject) {
            dialogState.reject();
        }
        else if (dialogState.resolve) {
            dialogState.resolve(false);
        }
        set({ dialogState: initialDialogState });
    },
    setInputValue: (value) => {
        set((state) => ({
            dialogState: {
                ...state.dialogState,
                inputValue: value,
            },
        }));
    },
}), {
    name: 'DialogStore',
    enabled: process.env.NODE_ENV === 'development',
}));
/**
 * Hook to use dialog store
 * Compatible with useDialog from Next.js context
 */
export const useDialog = () => {
    const store = useDialogStore();
    return {
        showDialog: store.showDialog,
        alert: store.alert,
        confirm: store.confirm,
        prompt: store.prompt,
        info: store.info,
        success: store.success,
        warning: store.warning,
        error: store.error,
    };
};
/**
 * Hook to get dialog state (for rendering Dialog component)
 */
export const useDialogState = () => {
    const dialogState = useDialogStore((state) => state.dialogState);
    const closeDialog = useDialogStore((state) => state.closeDialog);
    const setInputValue = useDialogStore((state) => state.setInputValue);
    const handleConfirm = () => {
        const state = useDialogStore.getState();
        if (state.dialogState.resolve) {
            if (state.dialogState.type === 'prompt') {
                state.dialogState.resolve(state.dialogState.inputValue || '');
            }
            else {
                state.dialogState.resolve(true);
            }
        }
    };
    const handleCancel = () => {
        const state = useDialogStore.getState();
        if (state.dialogState.type === 'prompt') {
            if (state.dialogState.resolve) {
                state.dialogState.resolve(null);
            }
        }
        else if (state.dialogState.reject) {
            state.dialogState.reject();
        }
        else if (state.dialogState.resolve) {
            state.dialogState.resolve(false);
        }
        closeDialog();
    };
    return {
        dialogState,
        handleConfirm,
        handleCancel,
        setInputValue,
    };
};
