/**
 * Insights API Route
 *
 * GET /api/oneagenda/insights - Get user insights and analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@onecoach/lib-core/auth';
import { IntelligentAssistantService } from '@onecoach/oneagenda-core';
import { oneagendaDB } from '@onecoach/oneagenda-core';
import { logger } from '@onecoach/lib-shared';
import { prisma } from '@onecoach/lib-core';

const assistant = new IntelligentAssistantService();

/**
 * GET /api/oneagenda/insights
 * Get user insights and analytics
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const periodStart = searchParams.get('periodStart');
    const periodEnd = searchParams.get('periodEnd');

    const start = periodStart
      ? new Date(periodStart)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = periodEnd ? new Date(periodEnd) : new Date();

    // Fetch user data
    const tasks = await oneagendaDB.getTasks(session.user.id);
    const goals = await oneagendaDB.getGoals(session.user.id);

    // Fetch milestones for user's goals
    const goalIds = goals.map((g: unknown) => g.id);
    const milestonesData = await prisma.oneagenda_milestones.findMany({
      where: {
        goalId: { in: goalIds },
      },
      orderBy: {
        order: 'asc',
      },
    });

    const milestones = milestonesData.map((milestone: unknown) => ({
      id: milestone.id,
      goalId: milestone.goalId,
      title: milestone.title,
      description: milestone.description,
      status: milestone.status,
      targetDate: milestone.targetDate.toISOString(),
      completedAt: milestone.completedAt?.toISOString(),
      tasksCompleted: milestone.tasksCompleted,
      tasksTotal: milestone.tasksTotal,
      percentComplete: milestone.percentComplete,
    }));

    // Generate insights using Reflection Agent
    const insights = await assistant.trackProgress({
      userId: session.user.id,
      tasks,
      goals,
      milestones,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    });

    return NextResponse.json(insights);
  } catch (error: unknown) {
    logger.error('Get insights error', { error, userId: session.user.id });
    return NextResponse.json({ error: 'Failed to get insights' }, { status: 500 });
  }
}
