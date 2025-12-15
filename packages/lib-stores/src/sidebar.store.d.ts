import type { ReactNode } from 'react';
interface SidebarStore {
    extraContent: ReactNode | null;
    setExtraContent: (content: ReactNode | null) => void;
}
export declare const useSidebarStore: import("zustand").UseBoundStore<import("zustand").StoreApi<SidebarStore>>;
export {};
//# sourceMappingURL=sidebar.store.d.ts.map