import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserAsync } from '@/lib/api-auth';
import { runFullContractPipeline } from '@/services/contract-pipeline';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUserAsync(req);
  const { id } = await params;

  try {
    // Run pipeline asynchronously so response is immediate and client polls live progress!
    runFullContractPipeline(id).catch(err => console.error('Reanalyze error:', err));

    return NextResponse.json({ success: true, message: 'AI Analysis pipeline started' });
  } catch (error: any) {
    console.error('Re-analyze API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to trigger re-analysis' }, { status: 500 });
  }
}
