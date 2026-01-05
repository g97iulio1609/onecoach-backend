import type { ReactNode } from 'react';
interface HeaderActionsState {
    actions: ReactNode | null;
    leftContent: ReactNode | null;
    setActions: (actions: ReactNode | null) => void;
    setLeftContent: (content: ReactNode | null) => void;
}
export declare const useHeaderActions: import("zustand").UseBoundStore<import("zustand").StoreApi<HeaderActionsState>>;
export {};
//# sourceMappingURL=header-actions.store.d.ts.map