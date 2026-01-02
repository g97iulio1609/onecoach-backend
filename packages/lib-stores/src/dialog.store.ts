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
 * Initial dialog state
 */
const initialDialogState: DialogState = {
  isOpen: false,
  message: '',
};

/**
 * Dialog Store
 */
export const useDialogStore = create<DialogStore>()(
  devtools(
    (set, get) => ({
      dialogState: initialDialogState,

      showDialog: (options: DialogOptions): Promise<boolean | string | null> => {
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

      alert: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel'>): Promise<void> => {
        return get()
          .showDialog({ type: 'alert', message, ...options })
          .then(() => undefined);
      },

      confirm: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel' | 'cancelLabel'>): Promise<boolean> => {
        return get()
          .showDialog({ type: 'confirm', message, ...options })
          .then((result) => result === true);
      },

      prompt: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel' | 'cancelLabel' | 'defaultValue' | 'placeholder'>): Promise<string | null> => {
        return get()
          .showDialog({
            type: 'prompt',
            message,
            ...options,
            placeholder: options?.placeholder || 'Enter a value...',
          })
          .then((result) => (result === null ? null : String(result)));
      },

      info: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel'>): Promise<void> => {
        return get()
          .showDialog({ type: 'info', message, ...options })
          .then(() => undefined);
      },

      success: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel'>): Promise<void> => {
        return get()
          .showDialog({ type: 'success', message, ...options })
          .then(() => undefined);
      },

      warning: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel' | 'cancelLabel'>): Promise<void> => {
        return get()
          .showDialog({ type: 'warning', message, ...options })
          .then(() => undefined);
      },

      error: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmLabel'>): Promise<void> => {
        return get()
          .showDialog({ type: 'error', message, ...options })
          .then(() => undefined);
      },

      closeDialog: () => {
        const { dialogState } = get();
        if (dialogState.reject) {
          dialogState.reject();
        } else if (dialogState.resolve) {
          dialogState.resolve(false);
        }
        set({ dialogState: initialDialogState });
      },

      setInputValue: (value: string) => {
        set((state) => ({
          dialogState: {
            ...state.dialogState,
            inputValue: value,
          },
        }));
      },
    }),
    {
      name: 'DialogStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

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
      } else {
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
    } else if (state.dialogState.reject) {
      state.dialogState.reject();
    } else if (state.dialogState.resolve) {
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
