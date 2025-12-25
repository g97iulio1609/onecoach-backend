/**
 * Workout Tracking Service
 *
 * Service layer for managing workout session tracking.
 * Handles CRUD operations for WorkoutSession entities.
 *
 * SSOT: Usa SOLO setGroups per le serie, non exercise.sets legacy.
 *
 * Follows SOLID principles:
 * - Single Responsibility: Only manages workout session data
 * - Open/Closed: Extendable without modification
 * - Dependency Inversion: Depends on Prisma abstraction
 */

import { prisma } from '@onecoach/lib-core/prisma';
import type { Prisma } from '@prisma/client';
import { createId } from '@onecoach/lib-shared/id-generator';
import { mapToWorkoutSession, mapToWorkoutSessions } from './mappers/workout-session.mapper';
import { hydrateSetGroups } from './helpers/utils/set-group-helpers';
import { logger } from '@onecoach/lib-core';
import type {
  WorkoutSession,
  CreateWorkoutSessionRequest,
  UpdateWorkoutSessionRequest,
  WorkoutProgramStats,
} from '@onecoach/types';

/**
 * Create a new workout session
 *
 * Initializes a workout session with the exercises from the specified program day.
 * Session starts with all tracking fields empty (to be filled by user).
 */
export async function createWorkoutSession(
  userId: string,
  request: CreateWorkoutSessionRequest
): Promise<WorkoutSession> {
  logger.warn('[createWorkoutSession] Starting for user:', userId, 'request:', request);
  const { programId, weekNumber, dayNumber, notes } = request;

  try {
    // Fetch the workout program to get the exercises for this day
    const program = await prisma.workout_programs.findUnique({
      where: { id: programId },
    });

    logger.warn('[createWorkoutSession] Program found:', program ? 'yes' : 'no');

    if (!program) {
      throw new Error('Programma di allenamento non trovato');
    }

    if (program.userId !== userId) {
      throw new Error('Non hai i permessi per accedere a questo programma');
    }

    // Extract exercises from the program's week/day structure
    let weeks = program.weeks as any; // JSON from DB
    logger.warn(
      '[createWorkoutSession] Weeks type:',
      typeof weeks,
      'isArray:',
      Array.isArray(weeks)
    );

    if (typeof weeks === 'string') {
      try {
        weeks = JSON.parse(weeks);
        logger.warn('[createWorkoutSession] Parsed weeks from string');
      } catch (e) {
        logger.error('[createWorkoutSession] Failed to parse weeks JSON:', e);
        weeks = [];
      }
    }

    // Loose equality check for weekNumber to handle string/number mismatch in JSON
    const week = Array.isArray(weeks) ? weeks.find((w: any) => w.weekNumber == weekNumber) : null;

    if (!week) {
      logger.error(
        '[createWorkoutSession] Week not found:',
        weekNumber,
        'available:',
        Array.isArray(weeks) ? weeks.map((w: any) => w.weekNumber) : 'none'
      );
      throw new Error(`Settimana ${weekNumber} non trovata nel programma`);
    }

    // Loose equality check for dayNumber
    const day = week.days?.find((d: any) => d.dayNumber == dayNumber);

    if (!day) {
      logger.error(
        '[createWorkoutSession] Day not found:',
        dayNumber,
        'available:',
        week.days?.map((d: any) => d.dayNumber)
      );
      throw new Error(`Giorno ${dayNumber} non trovato nella settimana ${weekNumber}`);
    }

    logger.warn('[createWorkoutSession] Day found, exercises count:', day.exercises?.length);

    // Ensure exercises is a valid object for Prisma JSON
    // SSOT: setGroups è l'unica fonte di verità per le serie
    // Hydrate setGroups[].sets da baseSet + count usando helper centralizzato
    const exercises = day.exercises
      ? JSON.parse(JSON.stringify(day.exercises)).map((ex: any) => {
          if (ex.setGroups && ex.setGroups.length > 0) {
            logger.warn(
              `[createWorkoutSession] Hydrating setGroups for exercise ${ex.name || ex.id}`
            );
            // Usa helper SSOT per idratare i setGroups
            ex.setGroups = hydrateSetGroups(ex.setGroups);
          } else {
            // Se non ci sono setGroups, inizializza array vuoto
            ex.setGroups = [];
          }

          return ex;
        })
      : [];

    // Create session with exercises (tracking fields will be filled during workout)
    const session = await prisma.workout_sessions.create({
      data: {
        id: createId(),
        userId,
        programId,
        weekNumber,
        dayNumber,
        exercises: exercises,
        notes,
        updatedAt: new Date(),
      },
    });

    logger.warn('[createWorkoutSession] Session created:', session.id);

    // Map Prisma entity to domain type
    return mapToWorkoutSession(session);
  } catch (error) {
    logger.error('[createWorkoutSession] Error:', error);
    throw error;
  }
}

/**
 * Get a workout session by ID
 */
export async function getWorkoutSession(
  sessionId: string,
  userId: string
): Promise<WorkoutSession | null> {
  const session = await prisma.workout_sessions.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return null;
  }

  // Verify ownership
  if (session.userId !== userId) {
    throw new Error('Non hai i permessi per accedere a questa sessione');
  }

  // Map Prisma entity to domain type
  return mapToWorkoutSession(session);
}

/**
 * Get all workout sessions for a user
 *
 * @param userId - User ID
 * @param programId - Optional filter by program ID
 * @param limit - Max number of sessions to return
 */
export async function getWorkoutSessions(
  userId: string,
  programId?: string,
  limit?: number
): Promise<WorkoutSession[]> {
  const sessions = await prisma.workout_sessions.findMany({
    where: {
      userId,
      ...(programId && { programId }),
    },
    orderBy: {
      startedAt: 'desc',
    },
    ...(limit && { take: limit }),
  });

  // Map Prisma entities to domain types
  return mapToWorkoutSessions(sessions);
}

/**
 * Get all sessions for a specific program
 */
export async function getProgramSessions(
  programId: string,
  userId: string
): Promise<WorkoutSession[]> {
  return getWorkoutSessions(userId, programId);
}

/**
 * Update a workout session
 *
 * Typically called during or after a workout to update tracking data.
 */
export async function updateWorkoutSession(
  sessionId: string,
  userId: string,
  updates: UpdateWorkoutSessionRequest
): Promise<WorkoutSession> {
  const session = await getWorkoutSession(sessionId, userId);

  if (!session) {
    throw new Error('Sessione non trovata');
  }

  const updated = await prisma.workout_sessions.update({
    where: { id: sessionId },
    data: {
      ...(updates.exercises && {
        exercises: updates.exercises as unknown as Prisma.InputJsonValue,
      }),
      ...(updates.completedAt !== undefined && { completedAt: updates.completedAt }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
      updatedAt: new Date(),
    },
  });

  // Map Prisma entity to domain type
  return mapToWorkoutSession(updated);
}

/**
 * Delete a workout session
 */
export async function deleteWorkoutSession(sessionId: string, userId: string): Promise<void> {
  const session = await getWorkoutSession(sessionId, userId);

  if (!session) {
    throw new Error('Sessione non trovata');
  }

  await prisma.workout_sessions.delete({
    where: { id: sessionId },
  });
}

/**
 * Get workout program statistics
 *
 * Calculates completion rate, total sessions, etc. for a program.
 */
export async function getWorkoutProgramStats(
  programId: string,
  userId: string
): Promise<WorkoutProgramStats> {
  const sessions = await prisma.workout_sessions.findMany({
    where: {
      programId,
      userId,
    },
  });

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s: any) => s.completedAt !== null).length;
  const inProgressSessions = totalSessions - completedSessions;

  const lastSession = sessions.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0];

  // Calculate average duration for completed sessions
  const completedWithDuration = sessions.filter((s: any) => s.completedAt !== null && s.startedAt);
  const averageDuration =
    completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum: number, s) => {
          const duration = (s.completedAt!.getTime() - s.startedAt.getTime()) / (1000 * 60); // minutes
          return sum + duration;
        }, 0) / completedWithDuration.length
      : undefined;

  return {
    programId,
    totalSessions,
    completedSessions,
    inProgressSessions,
    completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
    averageDuration,
    lastSessionDate: lastSession?.startedAt,
  };
}

/**
 * Check if a session exists for a specific program day
 *
 * Useful for UI to show if user already tracked a specific day.
 */
export async function hasSessionForDay(
  userId: string,
  programId: string,
  weekNumber: number,
  dayNumber: number
): Promise<boolean> {
  const session = await prisma.workout_sessions.findFirst({
    where: {
      userId,
      programId,
      weekNumber,
      dayNumber,
    },
  });

  return session !== null;
}

/**
 * Get latest session for a program
 */
export async function getLatestProgramSession(
  programId: string,
  userId: string
): Promise<WorkoutSession | null> {
  const session = await prisma.workout_sessions.findFirst({
    where: {
      programId,
      userId,
    },
    orderBy: {
      startedAt: 'desc',
    },
  });

  if (!session) {
    return null;
  }

  // Map Prisma entity to domain type
  return mapToWorkoutSession(session);
}
