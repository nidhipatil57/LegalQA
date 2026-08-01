import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, authResponseError } from '@/lib/api-auth';
import { getEmbedding } from '@/lib/ai/embedding';

// Seed dataset fallback if org has 0 knowledge items
async function autoSeedOrgKnowledge(orgId: string) {
  try {
    const existing = await prisma.knowledgeBaseItem.count({
      where: { organizationId: orgId }
    });
    if (existing > 0) return;

    // Fetch template items from any existing org or create initial set
    const sampleItems = await prisma.knowledgeBaseItem.findMany({
      take: 47
    });

    if (sampleItems.length > 0) {
      for (const item of sampleItems) {
        await prisma.knowledgeBaseItem.create({
          data: {
            title: item.title,
            content: item.content,
            category: item.category,
            tags: item.tags,
            embedding: item.embedding,
            organizationId: orgId
          }
        });
      }
    }
  } catch (err) {
    console.error('Auto-seed org knowledge failed:', err);
  }
}

// GET: Fetch knowledge base items or search semantically
export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('q');
  const category = searchParams.get('category');
  const collection = searchParams.get('collection');
  const status = searchParams.get('status');

  try {
    const orgId = user.organizationId;
    await autoSeedOrgKnowledge(orgId);

    if (query && query.trim().length > 0) {
      // Semantic Vector Search using cosine_similarity
      const queryEmbedding = await getEmbedding(query);
      const arraySql = `ARRAY[${queryEmbedding.join(',')}]::double precision[]`;
      
      let querySql = `
        SELECT id, title, content, category, tags, "createdAt", "updatedAt",
          cosine_similarity(embedding, ${arraySql}) as similarity
        FROM "KnowledgeBaseItem"
        WHERE "organizationId" = $1
      `;
      
      const params: any[] = [orgId];
      let paramIdx = 2;
      
      if (category && category !== 'All Categories') {
        querySql += ` AND category = $${paramIdx} `;
        params.push(category);
        paramIdx++;
      }

      querySql += ` ORDER BY similarity DESC LIMIT 50; `;
      
      const items = await prisma.$queryRawUnsafe<any[]>(querySql, ...params);
      return NextResponse.json({ items });
    } else {
      // Standard fetch
      const whereClause: any = { organizationId: orgId };
      if (category && category !== 'All Categories') {
        whereClause.category = category;
      }
      
      const items = await prisma.knowledgeBaseItem.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
      });
      
      return NextResponse.json({ items });
    }
  } catch (error) {
    console.error('Fetch knowledge base error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add new knowledge base item or process document upload
export async function POST(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  try {
    const body = await req.json();
    const {
      title,
      content,
      category = 'Contract Templates',
      tags = [],
      collection = 'Corporate',
      version = 'v1.0',
      author = user.name || 'Legal Team',
      status = 'APPROVED',
      riskLevel = 'LOW',
      missingClauses = [],
      complianceCoverage = 95,
      clauseCount = 10,
      readingTime = '5 min',
      relatedDocs = [],
      summary = '',
      isUpload = false,
      fileType = 'DOCX'
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Auto-generate AI summary & metadata if missing or uploaded
    const finalSummary = summary || `AI Parsed ${category} document: ${title}. Indexed for semantic vector retrieval and RAG audit.`;
    const docBody = content;

    const structuredContent = JSON.stringify({
      version,
      author,
      status,
      collection,
      riskLevel,
      missingClauses,
      complianceCoverage,
      clauseCount: clauseCount || Math.max(5, Math.floor(content.length / 200)),
      readingTime: readingTime || `${Math.max(1, Math.ceil(content.length / 500))} min`,
      relatedDocs,
      versionHistory: [
        {
          version,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          author,
          changes: isUpload ? `Uploaded ${fileType} document and indexed vectors` : 'Initial draft creation',
          status
        }
      ],
      summary: finalSummary,
      body: docBody
    });

    // Generate 384-dim vector embedding
    const embeddingText = `${title}\n${category}\n${finalSummary}\n${tags.join(' ')}\n${docBody}`;
    const embedding = await getEmbedding(embeddingText);

    const item = await prisma.knowledgeBaseItem.create({
      data: {
        title,
        content: structuredContent,
        category,
        tags: Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        embedding,
        organizationId: user.organizationId,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: isUpload ? 'UPLOAD_KNOWLEDGE_DOC' : 'CREATE_KNOWLEDGE_ITEM',
        details: `Indexed knowledge base document '${title}' under category '${category}'.`,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Create knowledge item error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update knowledge base item (e.g. status, content, version)
export async function PATCH(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  try {
    const { id, status, title, body: newBody, version, changes } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const existing = await prisma.knowledgeBaseItem.findUnique({ where: { id } });
    if (!existing || existing.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(existing.content);
    } catch (e) {
      parsed = { body: existing.content };
    }

    if (status) parsed.status = status;
    if (newBody) parsed.body = newBody;
    if (version) parsed.version = version;
    
    if (changes) {
      const history = parsed.versionHistory || [];
      history.unshift({
        version: version || parsed.version || 'v1.1',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        author: user.name || 'Legal Team',
        changes: changes,
        status: status || parsed.status || 'APPROVED'
      });
      parsed.versionHistory = history;
    }

    const updatedContent = JSON.stringify(parsed);
    const embeddingText = `${title || existing.title}\n${existing.category}\n${parsed.summary || ''}\n${parsed.body || ''}`;
    const embedding = await getEmbedding(embeddingText);

    const item = await prisma.knowledgeBaseItem.update({
      where: { id },
      data: {
        title: title || existing.title,
        content: updatedContent,
        embedding
      }
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Update knowledge item error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete knowledge base item
export async function DELETE(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
  }

  try {
    const existing = await prisma.knowledgeBaseItem.findUnique({ where: { id } });
    if (!existing || existing.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Item not found or unauthorized' }, { status: 404 });
    }

    await prisma.knowledgeBaseItem.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'DELETE_KNOWLEDGE_ITEM',
        details: `Deleted knowledge base item '${existing.title}'.`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete knowledge item error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
