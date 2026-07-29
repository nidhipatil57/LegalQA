'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  MessageSquare, Send, Bot, User, Bookmark, Loader2, Sparkles,
  Command, Cpu, Zap, ArrowDown, RefreshCw, FileText
} from 'lucide-react';

import { Suspense } from 'react';

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramContractId = searchParams.get('id');

  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [streamingCitations, setStreamingCitations] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  
  // Analytics
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [latency, setLatency] = useState<number | null>(null);
  const [tokenUsage, setTokenUsage] = useState<{ prompt: number; completion: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Fetch analyzed contracts and conversations list
  useEffect(() => {
    fetch('/api/contracts')
      .then(res => res.json())
      .then(data => {
        const list = data.contracts || [];
        const analyzed = list.filter((c: any) => c.status !== 'PENDING_REVIEW');
        setContracts(analyzed);
        if (paramContractId) {
          setSelectedContractId(paramContractId);
        } else if (analyzed.length > 0) {
          setSelectedContractId(analyzed[0].id);
        }
      });

    fetchConversations();
  }, [paramContractId]);

  const fetchConversations = (selectIdAfter?: string) => {
    setLoadingConv(true);
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => {
        const list = data.conversations || [];
        setConversations(list);
        setLoadingConv(false);

        if (selectIdAfter) {
          const match = list.find((c: any) => c.id === selectIdAfter);
          if (match) {
            setActiveConversation(match);
            setMessages(match.messages || []);
          }
        } else if (list.length > 0 && !activeConversation) {
          setActiveConversation(list[0]);
          setMessages(list[0].messages || []);
          if (list[0].contractId) {
            setSelectedContractId(list[0].contractId);
          }
        }
      })
      .catch(() => setLoadingConv(false));
  };

  const handleSelectConversation = (conv: any) => {
    setActiveConversation(conv);
    setMessages(conv.messages || []);
    if (conv.contractId) {
      setSelectedContractId(conv.contractId);
    }
  };

  const handleStartNewChat = () => {
    setActiveConversation(null);
    setMessages([]);
    setStreamingMessage('');
    setStreamingCitations([]);
    setLatency(null);
    setTokenUsage(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isStreaming) return;

    const userText = inputMessage;
    setInputMessage('');
    
    // Add user message locally
    const newUserMsg = { id: Math.random().toString(), role: 'user', content: userText, createdAt: new Date() };
    setMessages(prev => [...prev, newUserMsg]);
    setIsStreaming(true);
    setStreamingMessage('');
    setStreamingCitations([]);
    
    const startTime = Date.now();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          contractId: selectedContractId || null,
          conversationId: activeConversation?.id || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No readable stream');

      let done = false;
      let accumulatedText = '';
      let isFirstMetadataChunk = true;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const textChunk = decoder.decode(value);
          
          // Parse metadata chunk if it exists
          if (isFirstMetadataChunk && textChunk.startsWith('__METADATA__:')) {
            isFirstMetadataChunk = false;
            const endIdx = textChunk.indexOf('\n\n');
            const metaJsonStr = textChunk.substring(13, endIdx);
            try {
              const metaData = JSON.parse(metaJsonStr);
              setStreamingCitations(metaData.citations || []);
              
              // If this was a new conversation, update active conv state
              if (!activeConversation) {
                fetchConversations(metaData.conversationId);
              }
            } catch (err) {
              console.error('Error parsing stream metadata:', err);
            }
            
            // Append remaining text (if any)
            const remainingText = textChunk.substring(endIdx + 2);
            if (remainingText) {
              accumulatedText += remainingText;
              setStreamingMessage(accumulatedText);
            }
          } else {
            accumulatedText += textChunk;
            setStreamingMessage(accumulatedText);
          }
        }
      }

      setLatency(Date.now() - startTime);
      setTokenUsage({
        prompt: Math.round(userText.length / 4) + 120, // estimate
        completion: Math.round(accumulatedText.length / 4),
      });

      // Save complete assistant message locally
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: accumulatedText,
          citations: streamingCitations.length > 0 ? streamingCitations : undefined,
          createdAt: new Date(),
        },
      ]);
      setStreamingMessage('');

      // Refresh list to pull updated messages
      if (activeConversation) {
        fetchConversations(activeConversation.id);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[80vh] items-stretch">
      {/* Sidebar Panel: Conversation History */}
      <div className="lg:col-span-1 glass-card rounded-2xl p-4 flex flex-col justify-between min-h-[350px]">
        <div>
          <button
            onClick={handleStartNewChat}
            className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/15 text-blue-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer mb-4"
          >
            <PlusIcon className="w-4 h-4" />
            New Audit Discussion
          </button>

          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Discussion Threads</h3>
          
          {loadingConv ? (
            <div className="text-center py-6 text-xs text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Loading threads...
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-6">No previous discussions.</p>
          ) : (
            <div className="space-y-1 overflow-y-auto max-h-[350px] pr-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-2.5 rounded-xl cursor-pointer text-left text-xs truncate transition flex items-center gap-2 ${
                    activeConversation?.id === conv.id
                      ? 'bg-blue-600/10 border border-blue-500/15 text-blue-400'
                      : 'hover:bg-white/[0.02] border border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mapped Contract Context */}
        <div className="border-t border-white/5 pt-4 mt-4">
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-2 px-1">Attached Context</label>
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="w-full px-2.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/10 text-white outline-none cursor-pointer"
          >
            <option value="" className="bg-[#090d1a]">Global Workspace Context</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#090d1a]">
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="lg:col-span-3 glass-panel rounded-2xl border-white/5 flex flex-col justify-between min-h-[500px]">
        {/* Chat Feed Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white leading-none">LegalQA Assistant</h3>
              <span className="text-[10px] text-gray-500">Autonomous RAG Reasoning</span>
            </div>
          </div>

          {/* Model info banner */}
          <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
            <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-gray-500" /> {model}</span>
            {latency && <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-500" /> {latency}ms</span>}
          </div>
        </div>

        {/* Message history */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[50vh] min-h-[300px]">
          {messages.length === 0 && !streamingMessage ? (
            <div className="text-center py-20 text-gray-500 space-y-4 max-w-sm mx-auto">
              <Command className="w-10 h-10 text-gray-700 mx-auto" />
              <h4 className="text-base font-bold text-white font-display">Contract Intelligence Assistant</h4>
              <p className="text-xs leading-relaxed">
                Ask specific questions about the attached contract, compare liabilities, or query payment obligations.
              </p>
            </div>
          ) : (
            <>
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div key={m.id} className={`flex gap-4 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center border ${
                      isUser 
                        ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
                        : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className="space-y-3">
                      <div className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                        isUser 
                          ? 'bg-blue-600/10 border-blue-500/10 text-white rounded-tr-none' 
                          : 'bg-white/[0.02] border-white/5 text-gray-200 rounded-tl-none'
                      }`}>
                        <div className="whitespace-pre-line">{m.content}</div>
                      </div>

                      {/* Message citations */}
                      {m.citations && m.citations.length > 0 && (
                        <div className="pl-2 space-y-1">
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Sources Mapped</span>
                          <div className="flex flex-wrap gap-2">
                            {m.citations.map((cit: any, idx: number) => (
                              <div
                                key={idx}
                                className="px-2 py-1 rounded bg-white/[0.02] border border-white/5 text-[9px] text-gray-400 flex items-center gap-1 font-mono hover:border-white/10"
                                title={cit.snippet}
                              >
                                <FileText className="w-3 h-3 text-blue-400" />
                                Citation {cit.citationId} (Index {cit.chunkIndex})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Streaming Content */}
              {streamingMessage && (
                <div className="flex gap-4 max-w-[85%]">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border-white/5 text-sm leading-relaxed text-gray-200 rounded-tl-none">
                      <div className="whitespace-pre-line">{streamingMessage}</div>
                      <span className="inline-block w-1.5 h-3 bg-blue-500 ml-1 animate-pulse" />
                    </div>

                    {/* Citations while streaming */}
                    {streamingCitations.length > 0 && (
                      <div className="pl-2 space-y-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Extracting Sources...</span>
                        <div className="flex flex-wrap gap-2">
                          {streamingCitations.map((cit: any, idx: number) => (
                            <div key={idx} className="px-2 py-1 rounded bg-white/[0.02] border border-white/5 text-[9px] text-gray-500 flex items-center gap-1 font-mono">
                              <FileText className="w-3 h-3 text-blue-500/70" />
                              Citation {cit.citationId} (Index {cit.chunkIndex})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 focus-within:border-blue-500/50 rounded-2xl px-4 py-3 transition">
            <input
              type="text"
              disabled={isStreaming}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isStreaming ? 'AI is typing...' : 'Ask a contract question... (e.g. Can supplier terminate early?)'}
              className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder-gray-500 disabled:text-gray-600"
            />
            
            <button
              type="submit"
              disabled={!inputMessage.trim() || isStreaming}
              className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 text-white flex items-center justify-center transition cursor-pointer"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 fill-white" />
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-gray-400"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" /> Loading Chat Assistant...</div>}>
      <ChatContent />
    </Suspense>
  );
}

// Simple Helper Icon Components
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
