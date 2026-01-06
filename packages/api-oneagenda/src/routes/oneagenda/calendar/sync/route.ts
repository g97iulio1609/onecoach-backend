/**
 * Calendar Sync API Route
 *
 * POST /api/oneagenda/calendar/sync - Trigger manual sync with external calendars
 * GET /api/oneagenda/calendar/sync - Get last sync status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@onecoach/lib-core/auth';
import { CalendarSyncService } from '@onecoach/oneagenda-core';
import { logger } from '@onecoach/lib-shared';

const syncService = new CalendarSyncService();

/**
 * POST /api/oneagenda/calendar/sync
 * Trigger manual sync with external calendars
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { provider, startDate, endDate } = body;

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Perform sync
    const result = await syncService.bidirectionalSync(
      session.user.id,
      provider,
      [], // Would fetch from DB in real implementation
      start,
      end
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    logger.error('Calendar sync error', { error, userId: session.user.id, provider });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/oneagenda/calendar/sync
 * Get last sync status
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const providers = syncService.getUserProviders(session.user.id);

    return NextResponse.json({
      providers: providers.map((p: unknown) => ({
        provider: p.provider,
        syncEnabled: p.syncEnabled,
        lastSyncAt: p.lastSyncAt,
      })),
    });
  } catch (error: unknown) {
    logger.error('Get sync status error', { error, userId: session.user.id });
    return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 });
  }
}
