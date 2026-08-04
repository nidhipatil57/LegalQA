import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserAsync, authResponseError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUserAsync(req);
  if (!user) return authResponseError();

  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: user.userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
