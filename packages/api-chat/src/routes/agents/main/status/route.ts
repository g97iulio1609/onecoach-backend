/**
 * Agents API Route - Status Endpoint
 *
 * Provides status information about agents, mesh orchestrator,
 * and learning statistics.
 *
 * @module app/api/agents/status/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAgentCoordinator } from '@onecoach/lib-ai-agents';
import { createAIModel } from '../../../lib/services/ai/model-factory';
import { auth } from '@onecoach/lib-core/auth';

import { logger } from '@onecoach/lib-core';
/**
 * GET /api/agents/status
 *
 * Get status of V2 agents and coordinator
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const includeMetrics = searchParams.get('metrics') === 'true';
    const agentType = searchParams.get('type') as 'nutrition' | 'workout' | 'analytics' | null;

    // Create a temporary coordinator to get status
    const { model } = await createAIModel({
      domain: 'analytics',
      operation: 'execution',
      tier: 'fast',
    });

    const coordinator = createAgentCoordinator({
      model,
      enableMesh: true,
      enableMemory: true,
      enableLearning: true,
      enableObservability: true,
    });

    // Register agents to get their status
    const agentTypes: ('nutrition' | 'workout' | 'analytics')[] = agentType
      ? [agentType]
      : ['nutrition', 'workout', 'analytics'];

    for (const type of agentTypes) {
      await coordinator.registerAgent(`${type}-${userId}`, type, userId);
    }

    // Get coordinator status
    const status = await coordinator.getStatus();

    // Build response
    interface AgentInfo {
      type: string;
      id: string;
      status: string;
      capabilities: string[];
      features: string[];
    }

    interface MeshInfo {
      enabled: boolean;
      autonomy: boolean;
      selfHealing: boolean;
      autoScaling: boolean;
    }

    interface FeaturesInfo {
      memory: {
        enabled: boolean;
        types: string[];
      };
      learning: {
        enabled: boolean;
        features: string[];
      };
      observability: {
        enabled: boolean;
        features: string[];
      };
    }

    const response: {
      version: string;
      timestamp: string;
      coordinator: {
        totalAgents: number;
        activeAgents: number;
        capabilities: string[];
        meshEnabled: boolean;
      };
      agents: AgentInfo[];
      mesh?: MeshInfo;
      features?: FeaturesInfo;
    } = {
      version: '2.5',
      timestamp: new Date().toISOString(),
      coordinator: {
        totalAgents: status.totalAgents,
        activeAgents: status.activeAgents,
        capabilities: status.capabilities,
        meshEnabled: status.meshEnabled,
      },
      agents: [],
    };

    // Add metrics if requested
    if (includeMetrics) {
      // Get mesh orchestrator metrics if available
      const meshOrchestrator = coordinator.getMeshOrchestrator();
      if (meshOrchestrator) {
        response.mesh = {
          enabled: true,
          autonomy: true,
          selfHealing: true,
          autoScaling: true,
        };
      }

      response.features = {
        memory: {
          enabled: true,
          types: ['short', 'long', 'working'],
        },
        learning: {
          enabled: true,
          features: ['pattern_recognition', 'strategy_optimization'],
        },
        observability: {
          enabled: true,
          features: ['tracing', 'metrics', 'alerts'],
        },
      };
    }

    // Add individual agent information
    response.agents = agentTypes.map((type: unknown) => ({
      type,
      id: `${type}-${userId}`,
      status: 'active',
      capabilities: getAgentCapabilities(type),
      features: ['memory', 'learning', 'reasoning', 'planning'],
    }));

    return NextResponse.json(response);
  } catch (error: unknown) {
    logger.error('[Agents Status API] Error:', error);
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
 * Helper function to get agent capabilities
 */
function getAgentCapabilities(type: 'nutrition' | 'workout' | 'analytics'): string[] {
  switch (type) {
    case 'nutrition':
      return ['nutrition', 'meal_planning', 'macro_calculation', 'diet_adjustment'];
    case 'workout':
      return ['workout', 'program_design', 'exercise_selection', 'progressive_overload'];
    case 'analytics':
      return ['analytics', 'pattern_recognition', 'insight_generation', 'benchmarking'];
    default:
      return [];
  }
}

/**
 * POST /api/agents/status
 *
 * Update agent status or trigger health checks
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'health_check') {
      // Perform health check on all agents
      const userId = session.user.id;

      const { model } = await createAIModel({
        domain: 'analytics',
        operation: 'execution',
        tier: 'fast',
      });

      const coordinator = createAgentCoordinator({
        model,
        enableMesh: true,
        enableMemory: true,
        enableLearning: true,
        enableObservability: true,
      });

      // Register agents
      await coordinator.registerAgent(`nutrition-${userId}`, 'nutrition', userId);
      await coordinator.registerAgent(`workout-${userId}`, 'workout', userId);
      await coordinator.registerAgent(`analytics-${userId}`, 'analytics', userId);

      const status = await coordinator.getStatus();

      return NextResponse.json({
        healthy: status.activeAgents === status.totalAgents,
        status,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        error: 'Invalid action',
        validActions: ['health_check'],
      },
      { status: 400 }
    );
  } catch (error: unknown) {
    logger.error('[Agents Status API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
