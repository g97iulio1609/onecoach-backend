/**
 * Single Conversation API
 *
 * Get single conversation by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@onecoach/lib-core';
import { prisma } from '@onecoach/lib-core';

import { logger } from '@onecoach/lib-core';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = id;

    const conversation = await prisma.conversations.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Verify ownership
    if (conversation.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Format messages
    const messagesArray =
      (conversation.messages as Array<{
        role: string;
        content: string;
        timestamp?: string;
      }>) || [];

    const messages = messagesArray.map((msg: unknown) => ({
      id: `msg_${Date.now()}_${Math.random()}`,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    }));

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      messages,
      metadata: conversation.metadata,
    });
  } catch (error: unknown) {
    logger.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
