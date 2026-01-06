/**
 * Credits History API Route
 *
 * GET: Ottiene lo storico transazioni crediti dell'utente corrente
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@onecoach/lib-core';
import { creditService } from '@onecoach/lib-core';
import { logError, mapErrorToApiResponse } from '@onecoach/lib-shared';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request) {
  const userOrError = await requireAuth();

  if (userOrError instanceof NextResponse) {
    return userOrError;
  }

  try {
    const { searchParams } = new URL(_req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const history = await creditService.getCreditHistory(userOrError.id, limit);

    return NextResponse.json({
      transactions: history,
      total: history.length,
    });
  } catch (error: unknown) {
    logError('Errore nel recupero dello storico crediti', error);
    const { response, status } = mapErrorToApiResponse(error);
    return NextResponse.json(response, { status });
  }
}
