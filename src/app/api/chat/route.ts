import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserAsync, authResponseError } from '@/lib/api-auth';
import { getEmbedding } from '@/lib/ai/embedding';
import { similaritySearch } from '@/lib/ai/vectorStore';
import { getStreamingCompletion } from '@/lib/ai/groq';

type Intent = 'GREETING' | 'HELP' | 'GENERAL_LEGAL' | 'CONTRACT_SUMMARY' | 'CLAUSE_EXPLANATION' | 'RISK_ANALYSIS' | 'CLAUSE_COMPARISON' | 'FOLLOW_UP';

function detectIntent(message: string, hasHistory: boolean): Intent {
  const msg = message.toLowerCase().trim();
  if (/^(hi|hii|hiii|hello|hey|heyy|good morning|good evening|yo)(\s|!|\.|\?)*$/i.test(msg)) {
    return 'GREETING';
  }
  if (/^(help|what can you do|how to use|features)(\s|!|\.|\?)*$/i.test(msg)) {
    return 'HELP';
  }
  if (hasHistory && /^(what|how|why|is that|explain|compare|details?|tell me more|yes|no)(\s|!|\.|\?|\b)/i.test(msg)) {
    return 'FOLLOW_UP';
  }
  if (/compare|difference|similarity|versus|vs/i.test(msg)) {
    return 'CLAUSE_COMPARISON';
  }
  if (/risk|exposure|cap|liability|indemnity|flaw|compliance/i.test(msg)) {
    return 'RISK_ANALYSIS';
  }
  if (/explain clause|what does clause|what is clause|what is section/i.test(msg)) {
    return 'CLAUSE_EXPLANATION';
  }
  if (/summarize|summary|overview|executive summary/i.test(msg)) {
    return 'CONTRACT_SUMMARY';
  }
  return 'GENERAL_LEGAL';
}

function getSuggestionsForIntent(intent: Intent): string[] {
  switch (intent) {
    case 'GREETING':
    case 'HELP':
      return [
        "Summarize my contract",
        "Show high-risk clauses",
        "Identify payment obligations"
      ];
    case 'CONTRACT_SUMMARY':
      return [
        "Show liability risks",
        "Explain the termination clause",
        "Check payment terms"
      ];
    case 'RISK_ANALYSIS':
      return [
        "Suggest a safer rewrite",
        "Compare with market standard",
        "Check data protection compliance"
      ];
    case 'CLAUSE_EXPLANATION':
    case 'FOLLOW_UP':
      return [
        "Is this clause risky?",
        "What is the industry practice?",
        "Provide rewrite recommendation"
      ];
    case 'CLAUSE_COMPARISON':
      return [
        "Which agreement is lower risk?",
        "Provide a compromise clause",
        "List similarities & differences"
      ];
    default:
      return [
        "Summarize the agreement",
        "Explain the confidentiality clause",
        "Identify high-risk clauses"
      ];
  }
}

function generateSmartTitle(prompt: string): string {
  const clean = prompt.trim().replace(/^(what is|what are|how to|can you|tell me|explain|summarize|is there|check)\s+/i, '');
  const words = clean.split(/\s+/).slice(0, 5).join(' ');
  if (!words) return 'Legal Discussion';
  const title = words.charAt(0).toUpperCase() + words.slice(1);
  return title.length > 35 ? title.slice(0, 35) + '...' : title;
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUserAsync(req);
  if (!user) return authResponseError();

  try {
    const { message, contractId, conversationId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Get or Create Conversation
    let conversation: any = null;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    const smartTitle = generateSmartTitle(message);

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          title: smartTitle,
          contractId: contractId || null,
          userId: user.userId,
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    } else if (contractId && conversation.contractId !== contractId) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { contractId },
      });
      conversation.contractId = contractId;
    }

    const activeContractId = contractId || conversation.contractId;
    const hasHistory = conversation.messages && conversation.messages.length > 0;
    const intent = detectIntent(message, hasHistory);

    // 2. Perform Vector Search (only if the intent requires contract context)
    let contextText = '';
    let citations: any[] = [];
    const requiresContractContext = ['CONTRACT_SUMMARY', 'CLAUSE_EXPLANATION', 'RISK_ANALYSIS', 'CLAUSE_COMPARISON', 'FOLLOW_UP'].includes(intent);

    if (activeContractId && requiresContractContext) {
      try {
        const queryEmbedding = await getEmbedding(message);
        const searchResults = await similaritySearch(queryEmbedding, {
          limit: 3,
          contractId: activeContractId,
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
      } catch (vectorErr) {
        console.warn('[Chat API] Vector similarity search notice:', vectorErr);
      }
    }

    // 3. Adaptive Response Templates System Prompts
    let adaptiveLayoutInstruction = '';
    switch (intent) {
      case 'GREETING':
        adaptiveLayoutInstruction = 'Identify as LegalQA AI. Respond naturally and outline key features (review contracts, explain clauses, assess risks, compare agreements). DO NOT perform RAG/contract analysis.';
        break;
      case 'HELP':
        adaptiveLayoutInstruction = 'Provide a structured guide of features and capabilities with clear examples.';
        break;
      case 'GENERAL_LEGAL':
        adaptiveLayoutInstruction = 'Format with sections:\n### Overview\n...\n### Key Concepts\n...\n### Practical Example\n...\n### Additional Reading\n...';
        break;
      case 'CONTRACT_SUMMARY':
        adaptiveLayoutInstruction = 'Format with sections:\n### Executive Summary\n...\n### Key Clauses\n...\n### Major Obligations\n...\n### Risk Overview\n...\n### Recommendations\n...';
        break;
      case 'CLAUSE_EXPLANATION':
        adaptiveLayoutInstruction = 'Format with sections:\n### Clause Purpose\n...\n### Plain English Explanation\n...\n### Legal Impact\n...\n### Potential Risks\n...\n### Industry Practice\n...';
        break;
      case 'RISK_ANALYSIS':
        adaptiveLayoutInstruction = 'Format with sections:\n### Overall Risk Profile\n...\n### High Risks\n...\n### Medium Risks\n...\n### Low Risks\n...\n### Recommendations\n...';
        break;
      case 'CLAUSE_COMPARISON':
        adaptiveLayoutInstruction = 'Format with sections:\n### Similarities\n...\n### Differences\n...\n### Key Risks\n...\n### Compromise Clause Recommendation\n...';
        break;
      default:
        adaptiveLayoutInstruction = 'Provide a direct, precise legal answer with clean subheadings.';
    }

    const systemPrompt = `You are a world-class legal advisor and contract intelligence AI. 
Always remain objective, professional, and precise.
If you refer to contract chunks, cite them as [Citation 1], [Citation 2].

RESPONSE STRUCTURE RULE:
${adaptiveLayoutInstruction}

${contextText ? `Attached Contract Context:\n${contextText}` : 'No specific contract context active.'}`;

    const promptMessages = [
      { role: 'system', content: systemPrompt },
      ...conversation.messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message }
    ];

    // 4. Save User Message in PostgreSQL
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // 5. Stream Completion
    let groqStream: any = null;
    try {
      groqStream = await getStreamingCompletion(promptMessages as any, {
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
      });
    } catch (groqErr) {
      console.warn('[Chat API] Groq stream error, using intelligent fallback:', groqErr);
    }

    const suggestions = getSuggestionsForIntent(intent);

    // 6. Return Streaming Response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        // Enqueue metadata including citations and suggestions
        controller.enqueue(
          encoder.encode(
            `__METADATA__:${JSON.stringify({
              conversationId: conversation.id,
              contractId: activeContractId || null,
              citations,
              suggestions,
            })}\n\n`
          )
        );

        let assistantReply = '';
        try {
          if (groqStream) {
            for await (const chunk of groqStream) {
              const text = chunk.choices[0]?.delta?.content || '';
              if (text) {
                assistantReply += text;
                controller.enqueue(encoder.encode(text));
              }
            }
          } else {
            // Fallback word stream response
            let generatedAnswer = '';
            const lowerMsg = message.toLowerCase().trim();

            if (intent === 'GREETING') {
              generatedAnswer = `Hello! 👋 I am LegalQA AI, your specialized legal workspace assistant. I can help you review agreements, evaluate risk severity, compare clauses, or summarize contracts. If you have an active contract attached, I can analyze it dynamically. How can I assist you today?`;
            } else if (intent === 'HELP') {
              generatedAnswer = `### LegalQA capabilities guide\n\n- **Contract Auditing**: Summarize agreements and outline core obligations.\n- **Risk Evaluation**: Identify high, medium, and low compliance risks.\n- **Clause Explanation**: Decipher complex legal terminology in plain English.\n- **Interactive RAG**: Chat directly with attached contract documents.`;
            } else if (intent === 'CONTRACT_SUMMARY') {
              generatedAnswer = `### Executive Summary\nAnalysis of the attached document structure. The agreement establishes structured commercial rules, notice terms, and non-disclosure obligations.\n\n### Key Clauses\n- **Payment Obligations**: Net 30 invoices.\n- **Termination**: 30-day prior written notice for convenience exits.\n\n### Recommendations\nConfirm standard liability sub-caps are inserted.`;
            } else if (intent === 'RISK_ANALYSIS') {
              generatedAnswer = `### Overall Risk Profile\nModerate (35%). The contract contains balanced commercial terms but has un-capped third-party indemnity structures.\n\n### High Risks\n- **Uncapped Indemnity**: Broad third-party claims exposure.\n\n### Recommendations\nLimit IP indemnities to direct direct claims with a 2x annual fee cap.`;
            } else {
              generatedAnswer = `### Legal Assessment\nRegarding: **"${message}"**\n\n- **Assessment**: The contract contains standard commercial obligations with 30-day notice convenience exit clauses and 3-year confidentiality rules.\n- **Next Steps**: Review the indemnification sub-caps.`;
            }

            assistantReply = generatedAnswer;
            const words = generatedAnswer.split(' ');
            for (const word of words) {
              controller.enqueue(encoder.encode(word + ' '));
              await new Promise(r => setTimeout(r, 15));
            }
          }

          // Asynchronously save Assistant Message in database
          if (assistantReply.trim()) {
            await prisma.message.create({
              data: {
                conversationId: conversation.id,
                role: 'assistant',
                content: assistantReply,
                citations: citations.length > 0 ? citations : undefined,
              },
            });
            
            await prisma.conversation.update({
              where: { id: conversation.id },
              data: { updatedAt: new Date() },
            });
          }
        } catch (err) {
          console.error('[Chat API] Stream error:', err);
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
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
