import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, authResponseError } from '@/lib/api-auth';
import { getEmbedding } from '@/lib/ai/embedding';
import { similaritySearch } from '@/lib/ai/vectorStore';
import { getStreamingCompletion } from '@/lib/ai/groq';

export async function POST(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return authResponseError();

  try {
    const { message, contractId, conversationId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Get or Create Conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          title: message.substring(0, 40) + '...',
          contractId: contractId || null,
          userId: user.userId,
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    // 2. Perform Vector Search for RAG context
    let contextText = '';
    let citations: any[] = [];
    
    if (contractId) {
      const queryEmbedding = await getEmbedding(message);
      const searchResults = await similaritySearch(queryEmbedding, {
        limit: 3,
        contractId,
      });

      if (searchResults.length > 0) {
        contextText = searchResults
          .map((r, i) => `[Citation ${i + 1}] (Chunk index: ${r.index}):\n${r.content}`)
          .join('\n\n');
        
        citations = searchResults.map((r, i) => ({
          citationId: i + 1,
          chunkIndex: r.index,
          snippet: r.content.substring(0, 150) + '...',
        }));
      }
    }

    // 3. Build Conversation History & System Prompts
    const systemPrompt = `You are a world-class legal advisor. Answer the user's question regarding the legal contract using the provided context chunks. 
Always remain objective, professional, and precise.
If you refer to facts within the context chunks, cite them by referencing [Citation 1], [Citation 2], etc.

${contextText ? `Relevant Context Chunks from Contract:\n${contextText}` : 'No specific contract context provided.'}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message }
    ];

    // 4. Save User Message in database
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // 5. Call Groq with Stream Mode
    const groqStream = await getStreamingCompletion(messages as any, {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
    });

    // 6. Return Streaming Response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        // First enqueue metadata containing conversation ID and citations
        controller.enqueue(
          encoder.encode(
            `__METADATA__:${JSON.stringify({
              conversationId: conversation.id,
              citations,
            })}\n\n`
          )
        );

        let assistantReply = '';
        try {
          for await (const chunk of groqStream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              assistantReply += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // Asynchronously save Assistant Message in database once stream ends
          if (assistantReply.trim()) {
            await prisma.message.create({
              data: {
                conversationId: conversation.id,
                role: 'assistant',
                content: assistantReply,
                citations: citations.length > 0 ? citations : undefined,
              },
            });
            
            // Update conversation title if default
            if (conversation.messages.length === 0) {
              await prisma.conversation.update({
                where: { id: conversation.id },
                data: { title: message.substring(0, 40) + '...' },
              });
            }
          }
        } catch (err) {
          console.error('[Chat API] Stream processing error:', err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
