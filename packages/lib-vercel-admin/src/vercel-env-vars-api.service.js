/**
 * Vercel Environment Variables API Service
 *
 * Servizio per gestire CRUD completo su Vercel Environment Variables tramite REST API v9
 * Gestisce API keys AI come secrets su Vercel invece che nel database
 *
 * Principi: KISS, SOLID, DRY, YAGNI
 */
import { logError } from '@onecoach/lib-shared/utils/error';
import { logger } from '@onecoach/lib-shared/utils/logger';
/**
 * Calcola delay per retry con exponential backoff
 */
function getRetryDelay(attempt) {
    return Math.pow(2, attempt) * 1000;
}
/**
 * Valida le variabili d'ambiente necessarie per le chiamate API Vercel
 * Rende opzionale il TEAM_ID (non tutti i progetti girano in un team)
 */
function validateVercelEnv() {
    const token = process.env.VERCEL_API_TOKEN?.trim();
    const projectId = process.env.VERCEL_PROJECT_ID?.trim();
    const teamId = process.env.VERCEL_TEAM_ID?.trim();
    if (!token || !projectId) {
        return null;
    }
    return {
        token,
        projectId,
        teamId: teamId || undefined,
    };
}
/**
 * Esegue una richiesta all'API Vercel con retry e gestione errori
 */
async function vercelApiRequest(endpoint, options = {}, retries = 2) {
    const envConfig = validateVercelEnv();
    if (!envConfig) {
        return {
            success: false,
            error: 'Vercel non configurato: VERCEL_API_TOKEN o VERCEL_PROJECT_ID mancanti',
        };
    }
    const { token, projectId, teamId } = envConfig;
    const hasQueryParams = endpoint.includes('?');
    const teamQuery = teamId ? `${hasQueryParams ? '&' : '?'}teamId=${teamId}` : '';
    const url = `https://api.vercel.com/v9/projects/${projectId}${endpoint}${teamQuery}`;
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
    };
    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Vercel API error: ${response.status} ${response.statusText}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error?.message || errorMessage;
                }
                catch (error) {
                    // Se non è JSON, usa il testo originale
                    if (errorText) {
                        errorMessage = `${errorMessage} - ${errorText}`;
                    }
                }
                // Retry solo per errori 5xx o rate limit
                if ((response.status >= 500 || response.status === 429) && attempt < retries) {
                    await new Promise((resolve) => setTimeout(resolve, getRetryDelay(attempt)));
                    continue;
                }
                return {
                    success: false,
                    error: errorMessage,
                };
            }
            const data = await response.json();
            return {
                success: true,
                data: data,
            };
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            // Retry solo per errori di rete
            if (attempt < retries && error instanceof TypeError) {
                await new Promise((resolve) => setTimeout(resolve, getRetryDelay(attempt)));
                continue;
            }
        }
    }
    return {
        success: false,
        error: lastError?.message || 'Errore sconosciuto nella chiamata API Vercel',
    };
}
/**
 * Crea una nuova Environment Variable su Vercel
 */
export async function createEnvVar(params) {
    const { key, value, environments, sensitive = true } = params;
    if (!key || !value) {
        return {
            success: false,
            error: 'key e value sono richiesti',
        };
    }
    // Vercel API restriction: sensitive env vars cannot target 'development'
    const filteredEnvironments = sensitive
        ? environments.filter(env => env !== 'development')
        : environments;
    const result = await vercelApiRequest('/env', {
        method: 'POST',
        body: JSON.stringify({
            key,
            value,
            type: sensitive ? 'sensitive' : 'encrypted',
            target: filteredEnvironments,
        }),
    });
    if (result.success && result.data) {
        logger.info(`[VercelEnvVars] Creato env var: ${key}`);
    }
    else {
        logError(`[VercelEnvVars] Errore creazione env var: ${key}`, {
            error: result.error,
            message: result.message,
            key,
            environments,
            sensitive,
        });
    }
    return result;
}
/**
 * Lista tutte le Environment Variables del progetto
 */
export async function listEnvVars() {
    return vercelApiRequest('/env');
}
/**
 * Trova una Environment Variable per chiave
 */
export async function getEnvVarByKey(key) {
    const listResult = await listEnvVars();
    if (!listResult.success || !listResult.data) {
        return {
            success: false,
            error: listResult.error || 'Errore nel recupero delle env vars',
        };
    }
    const envVar = listResult.data.envs.find((env) => env.key === key);
    if (!envVar) {
        return {
            success: false,
            error: `Environment variable "${key}" non trovata`,
        };
    }
    return {
        success: true,
        data: envVar,
    };
}
/**
 * Aggiorna una Environment Variable esistente
 */
export async function updateEnvVar(params) {
    const { envId, key, value, environments, sensitive } = params;
    if (!envId) {
        return {
            success: false,
            error: 'envId è richiesto',
        };
    }
    const updateData = {};
    if (key !== undefined)
        updateData.key = key;
    if (value !== undefined)
        updateData.value = value;
    if (environments !== undefined)
        updateData.target = environments;
    if (sensitive !== undefined)
        updateData.type = sensitive ? 'sensitive' : 'encrypted';
    const result = await vercelApiRequest(`/env/${envId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    });
    if (result.success && result.data) {
        logger.info(`[VercelEnvVars] Aggiornato env var: ${envId}`);
    }
    else {
        logError(`[VercelEnvVars] Errore aggiornamento env var: ${envId}`, {
            error: result.error,
        });
    }
    return result;
}
/**
 * Elimina una Environment Variable
 */
export async function deleteEnvVar(envId) {
    if (!envId) {
        return {
            success: false,
            error: 'envId è richiesto',
        };
    }
    const result = await vercelApiRequest(`/env/${envId}`, {
        method: 'DELETE',
    });
    if (result.success) {
        logger.info(`[VercelEnvVars] Eliminato env var: ${envId}`);
    }
    else {
        logError(`[VercelEnvVars] Errore eliminazione env var: ${envId}`, {
            error: result.error,
        });
    }
    return result;
}
/**
 * Verifica se una Environment Variable esiste per una chiave
 * Restituisce false se Vercel non è configurato (per permettere operazioni opzionali)
 */
export async function envVarExists(key) {
    const envConfig = validateVercelEnv();
    if (!envConfig) {
        return false; // Se Vercel non è configurato, assume che la key non esista
    }
    const result = await getEnvVarByKey(key);
    return result.success && result.data !== undefined;
}
