import AdmZip from 'adm-zip';
// @ts-ignore
import { PDFParse } from 'pdf-parse';

export interface DocumentChunkInput {
  content: string;
  index: number;
}

// REST API LlamaParse implementation
async function parseWithLlamaParse(buffer: Buffer, fileName: string): Promise<string> {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;
  if (!apiKey) {
    throw new Error('LLAMA_CLOUD_API_KEY is not defined in environment variables');
  }

  // 1. Upload File to Llama Cloud
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: 'application/octet-stream' });
  formData.append('file', blob, fileName);
  formData.append('purpose', 'parse');

  const uploadRes = await fetch('https://api.cloud.llamaindex.ai/api/v1/beta/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`LlamaParse upload failed: ${errText}`);
  }

  const fileObj = await uploadRes.json();
  const fileId = fileObj.id;

  // 2. Create Parse Job
  const parseRes = await fetch('https://api.cloud.llamaindex.ai/api/v2/parse', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_id: fileId,
      tier: 'agentic',
      version: 'latest', // REQUIRED field by LlamaParse v2
    }),
  });

  if (!parseRes.ok) {
    const errText = await parseRes.text();
    throw new Error(`LlamaParse job creation failed: ${errText}`);
  }

  const jobObj = await parseRes.json();
  const jobId = jobObj.id;

  // 3. Poll Status & Retrieve Full Markdown Results
  let status = 'PENDING';
  let markdown = '';
  let retries = 0;
  const maxRetries = 90; // 3 minutes max polling

  while (status !== 'COMPLETED' && status !== 'SUCCESS' && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const statusRes = await fetch(`https://api.cloud.llamaindex.ai/api/v2/parse/${jobId}?expand=markdown_full`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!statusRes.ok) {
      console.warn(`[LlamaParse] Poll status failed: ${await statusRes.text()}`);
      retries++;
      continue;
    }

    const jobDetail = await statusRes.json();
    status = jobDetail.job?.status || 'PENDING';

    if (status === 'COMPLETED' || status === 'SUCCESS') {
      markdown = jobDetail.markdown_full || '';
      break;
    }

    if (status === 'FAILED') {
      throw new Error('LlamaParse job failed');
    }

    retries++;
  }

  if (!markdown) {
    throw new Error('LlamaParse returned empty result or timed out');
  }

  return markdown;
}

export async function parsePdf(buffer: Buffer, fileName = 'contract.pdf'): Promise<string> {
  if (process.env.LLAMA_CLOUD_API_KEY) {
    try {
      console.log(`[Parser] Attempting LlamaParse for ${fileName}...`);
      return await parseWithLlamaParse(buffer, fileName);
    } catch (error) {
      console.warn('[Parser] LlamaParse failed, falling back to local pdf-parse:', error);
    }
  }

  // Fallback using the PDFParse class from pdf-parse 2.x
  try {
    const parser: any = new PDFParse({ data: new Uint8Array(buffer), verbosity: 0 });
    await parser.load();
    const data = await parser.getText();
    return data.text ? data.text.trim() : '';
  } catch (error) {
    console.error('[Parser] pdf-parse fallback failed:', error);
    return 'Error parsing PDF file.';
  }
}

export async function parseDocx(buffer: Buffer, fileName = 'contract.docx'): Promise<string> {
  if (process.env.LLAMA_CLOUD_API_KEY) {
    try {
      console.log(`[Parser] Attempting LlamaParse for ${fileName}...`);
      return await parseWithLlamaParse(buffer, fileName);
    } catch (error) {
      console.warn('[Parser] LlamaParse failed, falling back to local docx extractor:', error);
    }
  }

  // Fallback
  try {
    const zip = new AdmZip(buffer);
    const docXml = zip.readAsText('word/document.xml');
    
    // Strip XML tags and extract contents of <w:t> tags
    const matches = docXml.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (!matches) return '';
    
    return matches
      .map(m => m.replace(/<[^>]+>/g, ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    console.error('[Parser] DOCX extraction failed:', error);
    return 'Error parsing DOCX file.';
  }
}

export function chunkText(text: string, chunkSize = 1000, overlap = 200): DocumentChunkInput[] {
  const chunks: DocumentChunkInput[] = [];
  if (!text) return chunks;

  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push({
      content: chunk,
      index,
    });
    
    index++;
    start += (chunkSize - overlap);
  }

  return chunks;
}
