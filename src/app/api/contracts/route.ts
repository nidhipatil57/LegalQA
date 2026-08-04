import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserAsync } from '@/lib/api-auth';
import fs from 'fs';
import path from 'path';
import { parsePdf, parseDocx, chunkText } from '@/lib/ai/parser';
import { getEmbedding } from '@/lib/ai/embedding';
import { storeChunks } from '@/lib/ai/vectorStore';
import { runFullContractPipeline } from '@/services/contract-pipeline';
const UPLOAD_DIR = process.env.UPLOAD_PATH || 'd:/Nidhi/LegalQA/uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// GET: List contracts for organization
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUserAsync(req);

  try {
    const contracts = await prisma.contract.findMany({
      where: { organizationId: user.organizationId },
      include: {
        user: {
          select: { name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ contracts });
  } catch (error) {
    console.error('Fetch contracts error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Upload and process contract
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUserAsync(req);

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const customTitle = formData.get('title') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const title = customTitle || file.name;
    const fileExtension = path.extname(file.name).toLowerCase();
    const fileType = fileExtension === '.pdf' ? 'pdf' : fileExtension === '.docx' ? 'docx' : 'txt';

    // 1. Save file to disk
    const fileId = Math.random().toString(36).substring(2, 15);
    const fileName = `${fileId}-${file.name}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // 2. Extract Text
    let rawText = '';
    if (fileType === 'pdf') {
      rawText = await parsePdf(buffer, file.name);
    } else if (fileType === 'docx') {
      rawText = await parseDocx(buffer, file.name);
    } else {
      rawText = buffer.toString('utf8');
    }

    console.log(`[Upload API] Extracted text length for "${title}": ${rawText.length} characters`);
    console.log(`[Upload API] First 1000 chars:\n${rawText.slice(0, 1000)}`);

    // 3. Create Contract Record in database
    const contract = await prisma.contract.create({
      data: {
        title,
        fileUrl: `/uploads/${fileName}`,
        fileType,
        status: 'PENDING_REVIEW',
        organizationId: user.organizationId,
        userId: user.userId,
        metadata: {
          content: rawText,
          size: file.size,
          extractedLength: rawText.length,
        },
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'UPLOAD_CONTRACT',
        details: `Contract '${title}' uploaded. ID: ${contract.id}`,
      },
    });

    // 4. Chunk & Embed in background (or synchronously here since we want full flow working)
    const chunks = chunkText(rawText);
    if (chunks.length > 0) {
      const chunksWithEmbeddings = await Promise.all(
        chunks.map(async (c) => {
          const embedding = await getEmbedding(c.content);
          return {
            content: c.content,
            index: c.index,
            embedding,
          };
        })
      );

      // Save chunks to DB
      await storeChunks(contract.id, chunksWithEmbeddings);
    }

    // Trigger full AI pipeline
    runFullContractPipeline(contract.id).catch(err => console.error('Upload pipeline error:', err));

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
