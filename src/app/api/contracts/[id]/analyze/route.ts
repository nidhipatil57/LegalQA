import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserAsync } from '@/lib/api-auth';
import { getChatCompletion } from '@/lib/ai/groq';
import { Severity } from '@prisma/client';
import { getContractText, LEGAL_EXTRACTION_PROMPT, extractLegalFieldsFromText } from '@/services/contract-pipeline';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUserAsync(req);
  const { id } = await params;

  try {
    // 1. Get contract and its chunks
    const contract = await prisma.contract.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        chunks: { orderBy: { index: 'asc' } },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const fullText = await getContractText(contract);
    console.log(`[Analyze API] Extracted text length for "${contract.title}": ${fullText.length} characters`);
    console.log(`[Analyze API] First 1000 characters snippet:\n${fullText.slice(0, 1000)}`);

    const truncatedText = fullText.slice(0, 24000);
    const userPrompt = `Contract Title: ${contract.title}\n\nFull Contract Text:\n${truncatedText}`;

    // 2. Query Groq for Structured Analysis
    let parsedData: any = null;
    try {
      const aiResponse = await getChatCompletion([
        { role: 'system', content: LEGAL_EXTRACTION_PROMPT },
        { role: 'user', content: userPrompt }
      ], {
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1
      });

      console.log(`[Analyze API] AI Raw Response Length: ${aiResponse.content.length}`);
      const jsonMatch = aiResponse.content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        aiResponse.content.match(/{[\s\S]*}/);
      const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiResponse.content;
      parsedData = JSON.parse(jsonText.trim());
    } catch (e) {
      console.warn('[Analyze API] Groq LLM parsing warning, using semantic extractor fallback:', e);
      parsedData = extractLegalFieldsFromText(fullText, contract.title);
    }

    if (!parsedData || !parsedData.paymentTerms || parsedData.summary.includes('Invalid API Key') || !parsedData.risks || parsedData.risks.length < 2) {
      parsedData = extractLegalFieldsFromText(fullText, contract.title);
    }

    // 3. Write data to relational tables inside a transaction
    await prisma.$transaction(async (tx) => {
      await tx.contractAnalysis.deleteMany({ where: { contractId: contract.id } });
      await tx.risk.deleteMany({ where: { contractId: contract.id } });
      await tx.clause.deleteMany({ where: { contractId: contract.id } });

      await tx.contractAnalysis.create({
        data: {
          contractId: contract.id,
          summary: parsedData.summary || `Executive Summary of ${contract.title}`,
          parties: Array.isArray(parsedData.parties) ? parsedData.parties : ['Company', 'Counterparty'],
          keyDates: typeof parsedData.keyDates === 'object' && parsedData.keyDates ? parsedData.keyDates : { effectiveDate: 'Not Specified' },
          paymentTerms: parsedData.paymentTerms || null,
          liability: parsedData.liability || null,
          termination: parsedData.termination || null,
          jurisdiction: parsedData.jurisdiction || null,
          confidentiality: parsedData.confidentiality || null,
          forceMajeure: parsedData.forceMajeure || null,
          intellectualProperty: parsedData.intellectualProperty || null,
          disputeResolution: parsedData.disputeResolution || null,
          missingClauses: Array.isArray(parsedData.missingClauses) ? parsedData.missingClauses : null,
          complianceIssues: Array.isArray(parsedData.complianceIssues) ? parsedData.complianceIssues : null,
          confidenceScore: typeof parsedData.confidenceScore === 'number' ? parsedData.confidenceScore : 90,
        },
      });

      if (parsedData.risks && Array.isArray(parsedData.risks)) {
        for (const r of parsedData.risks) {
          const sev: Severity = r.severity === 'HIGH' ? Severity.HIGH : r.severity === 'MEDIUM' ? Severity.MEDIUM : Severity.LOW;
          await tx.risk.create({
            data: {
              contractId: contract.id,
              severity: sev,
              description: r.description || '',
              clauseText: r.clauseText || '',
              recommendation: r.recommendation || '',
              suggestedRewrite: r.suggestedRewrite || '',
              industryStandard: r.industryStandard || null,
            },
          });
        }
      }

      if (parsedData.clauses && Array.isArray(parsedData.clauses)) {
        for (const c of parsedData.clauses) {
          const riskLvl: Severity = c.riskLevel === 'HIGH' ? Severity.HIGH : c.riskLevel === 'MEDIUM' ? Severity.MEDIUM : Severity.LOW;
          await tx.clause.create({
            data: {
              contractId: contract.id,
              category: c.category || 'Other',
              text: c.text || '',
              summary: c.summary || '',
              riskLevel: riskLvl,
            },
          });
        }
      }

      await tx.contract.update({
        where: { id: contract.id },
        data: {
          riskScore: typeof parsedData.riskScore === 'number' ? parsedData.riskScore : 25,
          status: 'UNDER_REVIEW',
          analysisStatus: 'COMPLETED',
          progress: 100,
          auditStatus: 'AUDITED',
        },
      });
    });

    // Fetch updated contract to return
    const updatedContract = await prisma.contract.findUnique({
      where: { id: contract.id },
      include: {
        analysis: true,
        risks: true,
        clauses: true,
      },
    });

    return NextResponse.json({ contract: updatedContract });
  } catch (error: any) {
    console.error('[Analyze API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
