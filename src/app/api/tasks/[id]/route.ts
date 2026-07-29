import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, authResponseError } from '@/lib/api-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  const { id } = await params;

  try {
    const { status, checklist, priority, description } = await req.json();

    const task = await prisma.task.findUnique({
      where: { id },
      include: { assignedTo: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify workspace access (assignee's organization must match current user's organization)
    if (task.assignedTo.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: status !== undefined ? status : task.status,
        checklist: checklist !== undefined ? checklist : task.checklist,
        priority: priority !== undefined ? priority : task.priority,
        description: description !== undefined ? description : task.description,
      },
      include: {
        contract: { select: { title: true } },
        assignedTo: { select: { name: true, role: true } },
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'UPDATE_TASK',
        details: `Updated task '${task.title}'. Status: ${updatedTask.status}.`,
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
