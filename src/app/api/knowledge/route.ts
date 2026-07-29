import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, authResponseError } from '@/lib/api-auth';
import { getEmbedding } from '@/lib/ai/embedding';

// GET: Fetch knowledge base items or search semantically
export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('q');
  const category = searchParams.get('category');

  try {
    const orgId = user.organizationId;

    if (query) {
      // Semantic Vector Search
      const queryEmbedding = await getEmbedding(query);
      const arraySql = `ARRAY[${queryEmbedding.join(',')}]::double precision[]`;
      
      let querySql = `
        SELECT id, title, content, category, tags,
          cosine_similarity(embedding, ${arraySql}) as similarity
        FROM "KnowledgeBaseItem"
        WHERE "organizationId" = $1
      `;
      
      const params: any[] = [orgId];
      
      if (category) {
        querySql += ` AND category = $2 `;
        params.push(category);
      }
      
      querySql += ` ORDER BY similarity DESC LIMIT 8; `;
      
      const items = await prisma.$queryRawUnsafe<any[]>(querySql, ...params);
      return NextResponse.json({ items });
    } else {
      // Standard fetch
      const whereClause: any = { organizationId: orgId };
      if (category) {
        whereClause.category = category;
      }
      
      const items = await prisma.knowledgeBaseItem.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });
      
      return NextResponse.json({ items });
    }
  } catch (error) {
    console.error('Fetch knowledge base error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add new knowledge base item
export async function POST(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  try {
    const { title, content, category, tags } = await req.json();

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Title, content and category are required' }, { status: 400 });
    }

    // Generate embedding for semantic searching
    const embedding = await getEmbedding(`${title}\n${content}`);

    const item = await prisma.knowledgeBaseItem.create({
      data: {
        title,
        content,
        category,
        tags: tags || [],
        embedding,
        organizationId: user.organizationId,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'CREATE_KNOWLEDGE_ITEM',
        details: `Created knowledge base item '${title}' under category '${category}'.`,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Create knowledge item error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
