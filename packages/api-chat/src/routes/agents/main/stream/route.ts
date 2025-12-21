/**
 * Agents API Route - Streaming Endpoint
 *
 * Handles streaming agent execution using Server-Sent Events (SSE).
 * Provides real-time progress updates and observability data.
 *
 * @module app/api/agents/stream/route
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createAgentCoordinator, createAIModel, MODEL_CONSTANTS } from '@onecoach/lib-ai-agents';
import { auth } from '@onecoach/lib-core/auth';
import { TOKEN_LIMITS } from '@onecoach/constants/models';

/**
 * Request schema validation
 */
const streamRequestSchema = z.object({
  type: z.enum(['nutrition', 'workout', 'analytics', 'combined']),
  task: z.string().min(1).max(10000),
  context: z.record(z.string(), z.unknown()).optional(),
  strategy: z.enum(['single', 'parallel', 'sequential']).optional(),
});

/**
 * POST /api/agents/stream
 *
 * Execute agent task with streaming response
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = streamRequestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          details: validation.error.issues,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { type, task, context, strategy } = validation.data;
    const userId = session.user.id;

    // Create readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Helper to send SSE message
        const sendEvent = (eventType: string, data: Record<string, unknown>) => {
          const message = JSON.stringify({ type: eventType, data, timestamp: Date.now() });
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        };

        try {
          // Send start event
          sendEvent('start', { type, task, userId });

          // Create AI model
          sendEvent('progress', { step: 'initializing', message: 'Creating AI model...' });
          const { model } = await createAIModel({
            domain: type === 'combined' ? 'analytics' : type,
            operation: 'execution',
            tier: 'balanced',
            temperature: MODEL_CONSTANTS.DEFAULT_TEMPERATURE,
            maxTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
          });

          // Create coordinator
          sendEvent('progress', {
            step: 'coordinator',
            message: 'Initializing agent coordinator...',
          });
          const coordinator = createAgentCoordinator({
            model,
            enableMesh: type === 'combined',
            enableMemory: true,
            enableLearning: true,
            enableObservability: true,
          });

          // Register agents
          sendEvent('progress', { step: 'registration', message: 'Registering agents...' });
          if (type === 'nutrition' || type === 'combined') {
            await coordinator.registerAgent(`nutrition-${userId}`, 'nutrition', userId);
            sendEvent('agent_registered', {
              agentType: 'nutrition',
              agentId: `nutrition-${userId}`,
            });
          }
          if (type === 'workout' || type === 'combined') {
            await coordinator.registerAgent(`workout-${userId}`, 'workout', userId);
            sendEvent('agent_registered', { agentType: 'workout', agentId: `workout-${userId}` });
          }
          if (type === 'analytics' || type === 'combined') {
            await coordinator.registerAgent(`analytics-${userId}`, 'analytics', userId);
            sendEvent('agent_registered', {
              agentType: 'analytics',
              agentId: `analytics-${userId}`,
            });
          }

          // Execute workflow
          sendEvent('progress', { step: 'execution', message: 'Executing workflow...' });
          const result = await coordinator.executeWorkflow({
            type,
            userId,
            task,
            context,
            strategy,
          });

          // Send execution steps as they complete
          if (result.steps && result.steps.length > 0) {
            result.steps.forEach((_step, index) => {
              sendEvent('step_completed', {
                stepIndex: index,
                stepId: `step-${index}`,
                description: `Execution step ${index + 1}`,
                status: 'completed',
                tokensUsed: 0,
              });
            });
          }

          // Get coordinator status
          const status = await coordinator.getStatus();
          sendEvent('coordinator_status', { status });

          // Send result
          sendEvent('result', {
            success: result.success,
            result: result.result,
            error: result.error,
            metadata: {
              tokensUsed: result.tokensUsed,
              timeMs: result.timeMs,
              strategy: result.strategy,
              stepsCount: result.steps.length,
              mesh: result.mesh,
              insights: result.insights,
            },
          });

          // Send completion event
          sendEvent('complete', {
            success: result.success,
            totalTime: result.timeMs,
            totalTokens: result.tokensUsed,
          });
        } catch (error: unknown) {
          // Send error event
          sendEvent('error', {
            message: error instanceof Error ? error.message : 'Unknown error',
            error: error instanceof Error ? error.stack : undefined,
          });
        } finally {
          // Close stream
          controller.close();
        }
      },
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering in nginx
      },
    });
  } catch (error: unknown) {
    console.error('[Agents Stream API] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
