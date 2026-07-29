import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, authResponseError } from '@/lib/api-auth';

// GET: List all tasks for organization
export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  try {
    const tasks = await prisma.task.findMany({
      where: {
        assignedTo: { organizationId: user.organizationId },
      },
      include: {
        contract: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a task
export async function POST(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  try {
    const { title, description, priority, dueDate, contractId, assignedToId, checklist } = await req.json();

    if (!title || !assignedToId) {
      return NextResponse.json({ error: 'Title and assigned lawyer are required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        contractId: contractId || null,
        assignedToId,
        checklist: checklist || [],
      },
      include: {
        contract: { select: { title: true } },
        assignedTo: { select: { name: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'CREATE_TASK',
        details: `Created task '${title}' assigned to lawyer ID: ${assignedToId}`,
      },
    });

    // Create notification for assignee
    await prisma.notification.create({
      data: {
        userId: assignedToId,
        title: 'New Task Assigned',
        message: `You have been assigned task '${title}' for contract review.`,
        type: 'task_assigned',
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
