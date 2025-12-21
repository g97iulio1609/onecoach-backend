/**
 * Vercel Environment Variables API Service
 *
 * Servizio per gestire CRUD completo su Vercel Environment Variables tramite REST API v9
 * Gestisce API keys AI come secrets su Vercel invece che nel database
 *
 * Principi: KISS, SOLID, DRY, YAGNI
 */
export type VercelEnvironment = 'production' | 'preview' | 'development';
export interface VercelEnvVar {
    id: string;
    key: string;
    value: string;
    type: 'system' | 'secret' | 'encrypted' | 'plain';
    target: VercelEnvironment[];
    gitBranch?: string;
    configurationId?: string;
    updatedAt?: number;
    createdAt?: number;
}
export interface CreateEnvVarParams {
    key: string;
    value: string;
    environments: VercelEnvironment[];
    sensitive?: boolean;
}
export interface UpdateEnvVarParams {
    envId: string;
    key?: string;
    value?: string;
    environments?: VercelEnvironment[];
    sensitive?: boolean;
}
export interface VercelApiResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
/**
 * Crea una nuova Environment Variable su Vercel
 */
export declare function createEnvVar(params: CreateEnvVarParams): Promise<VercelApiResult<VercelEnvVar>>;
/**
 * Lista tutte le Environment Variables del progetto
 */
export declare function listEnvVars(): Promise<VercelApiResult<{
    envs: VercelEnvVar[];
}>>;
/**
 * Trova una Environment Variable per chiave
 */
export declare function getEnvVarByKey(key: string): Promise<VercelApiResult<VercelEnvVar>>;
/**
 * Aggiorna una Environment Variable esistente
 */
export declare function updateEnvVar(params: UpdateEnvVarParams): Promise<VercelApiResult<VercelEnvVar>>;
/**
 * Elimina una Environment Variable
 */
export declare function deleteEnvVar(envId: string): Promise<VercelApiResult<void>>;
/**
 * Verifica se una Environment Variable esiste per una chiave
 * Restituisce false se Vercel non è configurato (per permettere operazioni opzionali)
 */
export declare function envVarExists(key: string): Promise<boolean>;
