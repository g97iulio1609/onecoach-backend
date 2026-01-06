/**
 * Schedule API Route
 *
 * POST /api/oneagenda/schedule - Generate daily schedule
 * GET /api/oneagenda/schedule - Get daily schedule
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@onecoach/lib-core/auth';
import { IntelligentAssistantService } from '@onecoach/oneagenda-core';
import { oneagendaDB } from '@onecoach/oneagenda-core';
import { logger } from '@onecoach/lib-shared';
import { prisma } from '@onecoach/lib-core';

/**
 * POST /api/oneagenda/schedule
 *
 * Body:
 * - date: string (ISO date)
 * - tasks?: Task[]
 * - events?: CalendarEvent[]
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, tasks = [], events = [] } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Create intelligent assistant
    const assistant = new IntelligentAssistantService();

    // Get user preferences (for future use)
    const _preferences = await oneagendaDB.getUserPreferences(session.user.id);

    // If no tasks provided, fetch from database
    const tasksToUse = tasks.length > 0 ? tasks : await oneagendaDB.getTasks(session.user.id);

    // Generate schedule
    const scheduleResult = await assistant.planDay({
      userId: session.user.id,
      date,
      tasks: tasksToUse,
      events,
    });

    // Return schedule in the format expected by the UI
    return NextResponse.json({
      date: scheduleResult.schedule.date,
      blocks: scheduleResult.schedule.blocks,
    });
  } catch (error: unknown) {
    logger.error('Error generating schedule', { error, userId: session.user.id, date });
    // Return empty schedule instead of error to allow UI to render
    return NextResponse.json({
      date,
      blocks: [],
    });
  }
}

/**
 * GET /api/oneagenda/schedule
 *
 * Query params:
 * - date: string (ISO date)
 */
export async function GET(request: NextRequest) {
  // Keep searchParams available in the whole scope (including catch) to avoid ReferenceError
  const searchParams = request.nextUrl.searchParams;
  const requestedDate = searchParams.get('date');
  const fallbackDate = requestedDate || new Date().toISOString().split('T')[0];

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const date = requestedDate;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Fetch tasks and events from database
    const tasks = await oneagendaDB.getTasks(session.user.id);

    // Fetch calendar events for the specified date
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const calendarEvents = await prisma.oneagenda_calendar_events.findMany({
      where: {
        userId: session.user.id,
        startTime: {
          gte: dateStart,
          lte: dateEnd,
        },
        status: 'CONFIRMED',
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const events = calendarEvents.map((event: unknown) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      allDay: event.allDay,
      type: event.type,
      source: event.source,
    }));

    // If no tasks, return empty schedule immediately
    if (tasks.length === 0) {
      return NextResponse.json({
        date,
        blocks: [],
      });
    }

    // Get user preferences (optional, will use defaults if not available, reserved for future use)
    const _preferences = await oneagendaDB.getUserPreferences(session.user.id);

    // Create intelligent assistant
    const assistant = new IntelligentAssistantService();

    // Generate schedule
    const scheduleResult = await assistant.planDay({
      userId: session.user.id,
      date,
      tasks,
      events,
    });

    // Return schedule in the format expected by the UI
    return NextResponse.json({
      date: scheduleResult.schedule.date,
      blocks: scheduleResult.schedule.blocks,
    });
  } catch (error: unknown) {
    logger.error('Error fetching schedule', { error });
    // Return empty schedule instead of error to allow UI to render
    return NextResponse.json({
      date: fallbackDate,
      blocks: [],
    });
  }
}
