/**
 * Copilot Conversations API
 *
 * Get list of conversations for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@onecoach/lib-core/auth/session';
import { prisma } from '@onecoach/lib-core/prisma';

import { logger } from '@onecoach/lib-core';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || user.id;

    // Verify user can only access their own conversations
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const conversations = await prisma.conversations.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    // Format conversations for UI
    const formattedConversations = conversations.map(
      (conv: {
        id: string;
        title: string | null;
        messages: unknown;
        updatedAt: Date;
        metadata: unknown;
      }) => {
        const messages = (conv.messages as Array<{ role: string; content: string }>) || [];
        const firstMessage = messages.find((m: { role: string }) => m.role === 'user');
        const preview = firstMessage?.content.slice(0, 60) || 'Empty conversation';

        return {
          id: conv.id,
          title: conv.title || preview,
          preview,
          updatedAt: conv.updatedAt,
          domain: conv.metadata ? (conv.metadata as { domain?: string }).domain : undefined,
        };
      }
    );

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error: unknown) {
    logger.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
