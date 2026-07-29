import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, authResponseError } from '@/lib/api-auth';
import fs from 'fs';
import path from 'path';
const UPLOAD_DIR = process.env.UPLOAD_PATH || 'd:/Nidhi/LegalQA/uploads';

// GET: Fetch details of a contract
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  const { id } = await params;

  try {
    const contract = await prisma.contract.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        analysis: true,
        risks: { orderBy: { severity: 'asc' } },
        clauses: true,
        user: { select: { name: true, role: true } },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('Fetch contract details error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete a contract
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  const { id } = await params;

  try {
    const contract = await prisma.contract.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Delete file from disk
    const fileName = path.basename(contract.fileUrl);
    const filePath = path.join(UPLOAD_DIR, fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete file from disk: ${filePath}`, err);
      }
    }

    // Delete record from database (cascade will handle child models)
    await prisma.contract.delete({
      where: { id: contract.id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'DELETE_CONTRACT',
        details: `Deleted contract '${contract.title}'. ID: ${contract.id}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Contract deleted' });
  } catch (error) {
    console.error('Delete contract error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
