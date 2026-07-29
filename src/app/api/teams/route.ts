import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, authResponseError } from '@/lib/api-auth';
import { hashPassword } from '@/lib/auth';

// GET: List all workspace members
export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  try {
    const members = await prisma.user.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Fetch team members error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add / Invite team member
export async function POST(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  // Only permit ADMIN and PARTNER roles to invite members
  if (user.role !== 'ADMIN' && user.role !== 'PARTNER') {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  try {
    const { email, name, role, password } = await req.json();

    if (!email || !name || !role || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role,
        password: hashPassword(password),
        organizationId: user.organizationId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'INVITE_MEMBER',
        details: `Invited user '${name}' with role ${role}.`,
      },
    });

    return NextResponse.json({ member: newUser });
  } catch (error) {
    console.error('Add team member error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
