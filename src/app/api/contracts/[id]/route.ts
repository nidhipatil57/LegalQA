import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserAsync } from '@/lib/api-auth';
import fs from 'fs';
import path from 'path';
const UPLOAD_DIR = process.env.UPLOAD_PATH || 'd:/Nidhi/LegalQA/uploads';

// GET: Fetch details of a contract
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUserAsync(req);
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
    console.error('Fetch contract detail error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete a contract
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUserAsync(req);
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

    await prisma.contract.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete contract error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
