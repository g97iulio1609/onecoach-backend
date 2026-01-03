/**
 * Copilot Chat Stream API
 *
 * Unified streaming endpoint for Copilot chat using OneAgent SDK 2.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@onecoach/lib-core/auth/session';
import { getAgentRegistry } from '@onecoach/one-agent';
import { initializeAgentRegistryWithDB } from '@onecoach/lib-ai-agents';
import { prisma } from '@onecoach/lib-core/prisma';
import { logger } from '@onecoach/lib-shared/utils/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequest {
  conversationId?: string;
  message: string;
  userId: string;
  domain?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as ChatRequest;
    const { conversationId, message, domain } = body;

    // Initialize agent registry if needed
    const registry = getAgentRegistry();
    const stats = registry.getStats();
    if (stats.totalAgents === 0) {
      await initializeAgentRegistryWithDB(user.id);
    }

    // Get Copilot agent
    const copilotAgents = registry.discover({ role: 'copilot' });
    if (copilotAgents.length === 0) {
      return NextResponse.json({ error: 'Copilot agent not available' }, { status: 503 });
    }

    const copilotAgent = copilotAgents[0];

    // Create stream
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start processing in background
    (async () => {
      try {
        // Load conversation if exists
        let conversation = null;
        if (conversationId) {
          conversation = await prisma.conversations.findUnique({
            where: { id: conversationId },
          });
        }

        // Create or update conversation
        const isNewConversation = !conversation;
        const conversationMessages = conversation
          ? (conversation.messages as Array<{ role: string; content: string; timestamp: string }>)
          : [];

        // Add user message
        conversationMessages.push({
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        });

        // Send start event
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'start', data: { conversationId } })}\n\n`)
        );

        // Execute copilot (simplified for now - will integrate full mesh later)
        const response = `Hai scritto: "${message}". Il sistema Copilot unificato è in fase di integrazione. Presto potrai utilizzare tutte le funzionalità avanzate di OneAgent SDK 2.5!`;

        // Stream response character by character
        for (let i = 0; i < response.length; i += 5) {
          const chunk = response.slice(i, i + 5);
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'content', data: { content: chunk } })}\n\n`
            )
          );
          // Small delay for streaming effect
          await new Promise((resolve) => setTimeout(resolve, 20));
        }

        // Add assistant message
        conversationMessages.push({
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
        });

        // Save conversation
        let finalConversationId = conversationId;
        if (isNewConversation) {
          const newConv = await prisma.conversations.create({
            data: {
              id: `conv_${Date.now()}`,
              userId: user.id,
              title: message.slice(0, 50),
              messages: conversationMessages,
              metadata: { domain },
              updatedAt: new Date(),
            },
          });
          finalConversationId = newConv.id;
        } else {
          await prisma.conversations.update({
            where: { id: conversationId },
            data: {
              messages: conversationMessages,
              updatedAt: new Date(),
            },
          });
        }

        // Send complete event
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'complete',
              data: {
                conversationId: finalConversationId,
                domain: domain || 'general',
              },
            })}\n\n`
          )
        );

        await writer.write(encoder.encode('data: [DONE]\n\n'));

        // Record agent execution
        registry.recordExecution(copilotAgent.id, true);
      } catch (error: unknown) {
        logger.error('Copilot chat error:', error);
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              data: { message: 'An error occurred processing your message' },
            })}\n\n`
          )
        );
        registry.recordExecution(copilotAgent.id, false);
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    logger.error('Copilot chat route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
