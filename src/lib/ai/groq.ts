import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || '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';

export const groq = new Groq({
  apiKey,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getChatCompletion(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}
) {
  const model = options.model || 'llama-3.3-70b-versatile';
  
  const startTime = Date.now();
  try {
    const response = await groq.chat.completions.create({
      messages,
      model,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.max_tokens,
    });
    
    const latency = Date.now() - startTime;
    console.log(`[Groq AI] Call successful. Model: ${model}, Latency: ${latency}ms, Prompt tokens: ${response.usage?.prompt_tokens}, Completion tokens: ${response.usage?.completion_tokens}`);
    
    return {
      content: response.choices[0]?.message?.content || '',
      usage: response.usage,
      latency,
    };
  } catch (error) {
    console.error('[Groq AI] Error in completion:', error);
    return {
      content: `[Fallback Response] An error occurred while calling the Groq API. Please check your API key and connection.\nDetails: ${error instanceof Error ? error.message : String(error)}`,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      latency: Date.now() - startTime,
    };
  }
}

export async function getStreamingCompletion(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}
) {
  const model = options.model || 'llama-3.3-70b-versatile';
  return groq.chat.completions.create({
    messages,
    model,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.max_tokens,
    stream: true,
  });
}
