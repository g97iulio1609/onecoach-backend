/**
 * LEGACY ENDPOINT (AIConfig) - dismesso.
 * Tutta la configurazione modelli è centralizzata su admin provider (OpenRouter).
 * Restituisce 410 per impedire utilizzi residui.
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@onecoach/lib-core/auth/guards';
import { logError, mapErrorToApiResponse } from '@onecoach/lib-shared/utils/error';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userOrError = await requireAdmin();

  if (userOrError instanceof NextResponse) {
    return userOrError;
  }

  try {
    return NextResponse.json(
      {
        error: 'AIConfig legacy dismesso. Usa Admin > Impostazioni AI (provider OpenRouter).',
      },
      { status: 410 }
    );
  } catch (error: unknown) {
    logError('Errore nel recupero delle configurazioni AI', error);
    const { response, status } = mapErrorToApiResponse(error);
    return NextResponse.json(response, { status });
  }
}

export async function PUT(_req: Request) {
  const userOrError = await requireAdmin();

  if (userOrError instanceof NextResponse) {
    return userOrError;
  }

  try {
    return NextResponse.json(
      {
        error: 'AIConfig legacy dismesso. Usa Admin > Impostazioni AI (provider OpenRouter).',
      },
      { status: 410 }
    );
  } catch (error: unknown) {
    logError("Errore nell'aggiornamento della configurazione AI", error);
    const { response, status } = mapErrorToApiResponse(
      error,
      "Errore nell'aggiornamento della configurazione"
    );
    return NextResponse.json(response, { status });
  }
}
