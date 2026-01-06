/**
 * Agents API Route - Main Execution Endpoint
 *
 * Handles agent execution requests using OneAgent SDK 2.5 V2 agents.
 * Supports nutrition, workout, and analytics agents with full observability.
 *
 * @module app/api/agents/route
 */

import { NextRequest, NextResponse, auth } from '@onecoach/lib-ai-agents';

import { logger } from '@onecoach/lib-core';
/**
 * Request schema validation
 */
const agentRequestSchema = z.object({
  type: z.enum(['nutrition', 'workout', 'analytics', 'combined']),
  task: z.string().min(1).max(10000),
  context: z.record(z.string(), z.unknown()).optional(),
  strategy: z.enum(['single', 'parallel', 'sequential']).optional(),
  options: z
    .object({
      enableMemory: z.boolean().optional(),
      enableLearning: z.boolean().optional(),
      enableObservability: z.boolean().optional(),
    })
    .optional(),
});

/**
 * POST /api/agents
 *
 * Execute agent task with V2 agents
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = agentRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { type, task, context, strategy, options } = validation.data;
    const userId = session.user.id;

    // Create AI model for agents
    const { model } = await createAIModel({
      domain: type === 'combined' ? 'analytics' : type,
      operation: 'execution',
      tier: 'balanced',
      temperature: MODEL_CONSTANTS.DEFAULT_TEMPERATURE,
      maxTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
    });

    // Create agent coordinator
    const coordinator = createAgentCoordinator({
      model,
      enableMesh: type === 'combined', // Enable mesh for combined workflows
      enableMemory: options?.enableMemory ?? true,
      enableLearning: options?.enableLearning ?? true,
      enableObservability: options?.enableObservability ?? true,
    });

    // Register appropriate agents
    if (type === 'nutrition' || type === 'combined') {
      await coordinator.registerAgent(`nutrition-${userId}`, 'nutrition', userId);
    }
    if (type === 'workout' || type === 'combined') {
      await coordinator.registerAgent(`workout-${userId}`, 'workout', userId);
    }
    if (type === 'analytics' || type === 'combined') {
      await coordinator.registerAgent(`analytics-${userId}`, 'analytics', userId);
    }

    // Execute workflow
    const result = await coordinator.executeWorkflow({
      type,
      userId,
      task,
      context,
      strategy,
    });

    // Get coordinator status for metadata
    const status = await coordinator.getStatus();

    // Return result with metadata
    return NextResponse.json(
      {
        success: result.success,
        result: result.result,
        error: result.error,
        metadata: {
          tokensUsed: result.tokensUsed,
          timeMs: result.timeMs,
          strategy: result.strategy,
          steps: result.steps.length,
          mesh: result.mesh,
          insights: result.insights,
          coordinatorStatus: status,
        },
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (error: unknown) {
    logger.error('[Agents API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents
 *
 * Get available agents and capabilities
 */
export async function GET() {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      version: '2.5',
      agents: [
        {
          type: 'nutrition',
          capabilities: ['nutrition', 'meal_planning', 'macro_calculation', 'diet_adjustment'],
          features: ['memory', 'learning', 'reasoning', 'planning'],
        },
        {
          type: 'workout',
          capabilities: ['workout', 'program_design', 'exercise_selection', 'progressive_overload'],
          features: ['memory', 'learning', 'reasoning', 'planning'],
        },
        {
          type: 'analytics',
          capabilities: ['analytics', 'pattern_recognition', 'insight_generation', 'benchmarking'],
          features: ['memory', 'learning', 'reasoning', 'embeddings'],
        },
      ],
      executionStrategies: ['single', 'parallel', 'sequential'],
      meshEnabled: true,
      observabilityEnabled: true,
    });
  } catch (error: unknown) {
    logger.error('[Agents API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
