/**
 * Legge un valore da Edge Config
 */
export declare function getEdgeConfigValue<T = unknown>(key: string): Promise<T | undefined>;
/**
 * Legge tutti i valori da Edge Config
 */
export declare function getAllEdgeConfigValues(): Promise<Record<string, unknown>>;
/**
 * Aggiorna un valore in Edge Config
 */
export declare function setEdgeConfigValue(key: string, value: unknown): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Aggiorna multiple valori in Edge Config
 */
export declare function setEdgeConfigValues(items: Array<{
    key: string;
    value: unknown;
}>): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Elimina un valore da Edge Config
 */
export declare function deleteEdgeConfigValue(key: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Edge Config Service Object
 * Wrapper per compatibilità con codice esistente
 */
export declare const edgeConfigService: {
    get<T = unknown>(key: string): Promise<T | undefined>;
    getAll(): Promise<Record<string, unknown>>;
    set(key: string, value: unknown): Promise<void>;
    setMany(items: Record<string, unknown>): Promise<void>;
    delete(key: string): Promise<void>;
};
