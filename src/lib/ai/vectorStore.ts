import { prisma } from '@/lib/prisma';

export interface VectorSearchResult {
  id: string;
  contractId: string;
  content: string;
  index: number;
  similarity: number;
}

export async function storeChunks(
  contractId: string,
  chunks: { content: string; index: number; embedding: number[] }[]
) {
  await prisma.documentChunk.createMany({
    data: chunks.map(c => ({
      contractId,
      index: c.index,
      content: c.content,
      embedding: c.embedding,
    })),
  });
}

export async function similaritySearch(
  embedding: number[],
  options: { limit?: number; contractId?: string } = {}
): Promise<VectorSearchResult[]> {
  const limit = options.limit || 5;
  const arraySql = `ARRAY[${embedding.join(',')}]::double precision[]`;
  
  let querySql = `
    SELECT id, "contractId", "content", "index",
      cosine_similarity(embedding, ${arraySql}) as similarity
    FROM "DocumentChunk"
  `;
  
  const params: any[] = [];
  if (options.contractId) {
    querySql += ` WHERE "contractId" = $1 `;
    params.push(options.contractId);
  }
  
  querySql += ` ORDER BY similarity DESC LIMIT ${limit} `;
  
  try {
    const results = await prisma.$queryRawUnsafe<VectorSearchResult[]>(querySql, ...params);
    return results;
  } catch (error) {
    console.error('[VectorStore] Error during similarity search:', error);
    return [];
  }
}
