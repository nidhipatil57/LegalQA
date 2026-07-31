'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  MessageSquare, Send, Bot, User, Loader2, Sparkles,
  Command, Cpu, Zap, FileText, Plus, HelpCircle
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
  
  // Model info
  const [model] = useState('llama-3.3-70b-versatile');
  const [latency, setLatency] = useState<number | null>(null);
  const [tokenUsage, setTokenUsage] = useState<{ prompt: number; completion: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      })
      .catch((err) => console.error('Fetch contracts in chat failed:', err));

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
      .catch((err) => {
        console.error('Fetch conversations failed:', err);
        setLoadingConv(false);
      });
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

  const handleSendMessage = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const textToSend = directText || inputMessage;
    if (!textToSend.trim() || isStreaming) return;

    setInputMessage('');
    
    // Add user message locally
    const newUserMsg = { id: Math.random().toString(), role: 'user', content: textToSend, createdAt: new Date() };
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
          message: textToSend,
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
          
          if (isFirstMetadataChunk && textChunk.startsWith('__METADATA__:')) {
            isFirstMetadataChunk = false;
            const endIdx = textChunk.indexOf('\n\n');
            const metaJsonStr = textChunk.substring(13, endIdx);
            try {
              const metaData = JSON.parse(metaJsonStr);
              setStreamingCitations(metaData.citations || []);
              
              if (!activeConversation) {
                fetchConversations(metaData.conversationId);
              }
            } catch (err) {
              console.error('Error parsing stream metadata:', err);
            }
            
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
        prompt: Math.round(textToSend.length / 4) + 120,
        completion: Math.round(accumulatedText.length / 4),
      });

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

      if (activeConversation) {
        fetchConversations(activeConversation.id);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  // Pre-filled suggestion prompt handler
  const handleSuggestionClick = (promptText: string) => {
    handleSendMessage(undefined, promptText);
  };

  const suggestions = [
    { label: "Liability Limits", text: "What is the limitation of liability cap on this agreement?" },
    { label: "Payment & SLA", text: "Summarize the payment terms, notice periods, and invoice deadlines." },
    { label: "Termination Rules", text: "Under what conditions can the parties terminate this contract early?" },
    { label: "IP Ownership", text: "Does the contract transfer intellectual property ownership? Explain." }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[80vh] items-stretch animate-fade-in relative">
      {/* Ambient Radial Blur */}
      <div className="absolute top-0 left-1/3 w-[30vw] h-[30vw] bg-indigo-600/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Sidebar Panel: Conversation History */}
      <div className="lg:col-span-1 spatial-card rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
        <div>
          <button
            onClick={handleStartNewChat}
            className="w-full py-3 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer mb-5 shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            New Discussion
          </button>

          <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 px-2 border-b border-white/[0.06] pb-2">
            Discussion Threads
          </h3>
          
          {loadingConv ? (
            <div className="text-center py-6 text-xs text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Loading threads...
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No previous discussions.</p>
          ) : (
            <div className="space-y-1.5 overflow-y-auto max-h-[350px] pr-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-3 rounded-xl cursor-pointer text-left text-xs truncate transition flex items-center gap-2.5 ${
                    activeConversation?.id === conv.id
                      ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border border-blue-500/30 text-blue-300 font-bold shadow-sm'
                      : 'hover:bg-white/[0.04] border border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeConversation?.id === conv.id ? 'text-blue-400' : 'text-gray-500'}`} />
                  <span className="truncate">{conv.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mapped Contract Context */}
        <div className="border-t border-white/[0.08] pt-4 mt-4">
          <label className="text-[9px] font-extrabold text-blue-300/80 uppercase tracking-[0.15em] block mb-2 px-1">Attached Context</label>
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="w-full px-3 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/10 text-white outline-none cursor-pointer hover:border-blue-500/40 transition-colors font-medium"
          >
            <option value="" className="bg-[#090d16]">Global Workspace Context</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#090d16]">
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="lg:col-span-3 spatial-card rounded-2xl flex flex-col justify-between min-h-[520px] relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Top Light Rim Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        {/* Chat Feed Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-white leading-none flex items-center gap-1.5">
                LegalQA AI <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
              </h3>
              <span className="text-[9px] text-blue-300/80 uppercase tracking-[0.15em] font-bold block mt-1">Autonomous RAG Agent Engine</span>
            </div>
          </div>

          {/* Model info banner */}
          <div className="flex items-center gap-3 text-[9px] font-mono">
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-gray-300 flex items-center gap-1.5 font-bold">
              <Cpu className="w-3.5 h-3.5 text-blue-400" /> {model}
            </span>
            {latency && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1 font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> {latency}ms
              </span>
            )}
          </div>
        </div>


        {/* Message history */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[50vh] min-h-[300px]">
          {messages.length === 0 && !streamingMessage ? (
            <div className="flex flex-col justify-center items-center h-full max-w-lg mx-auto py-10 text-center space-y-8">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-center text-blue-400 mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white font-display">Intelligence Chat Assistant</h4>
                <p className="text-xs leading-relaxed text-gray-400 font-light">
                  Initiate audit discussions. Query liabilities, notice bounds, and payment structures directly in natural language.
                </p>
              </div>

              {/* Suggestion prompt chips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(s.text)}
                    className="p-3 text-left rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all text-xs flex items-start gap-2.5 cursor-pointer group"
                  >
                    <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block mb-0.5">{s.label}</span>
                      <span className="text-[10px] text-gray-400 font-light leading-relaxed truncate block max-w-[200px] group-hover:text-gray-300">{s.text}</span>
                    </div>
                  </button>
                ))}
              </div>
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
                      <div className={`p-4 rounded-2xl border text-xs leading-relaxed shadow-sm ${
                        isUser 
                          ? 'bg-blue-600/10 border-blue-500/10 text-white rounded-tr-none' 
                          : 'bg-[#090d16]/50 border-white/5 text-gray-200 rounded-tl-none font-light'
                      }`}>
                        <div className="whitespace-pre-line">{m.content}</div>
                      </div>

                      {/* Message citations */}
                      {m.citations && m.citations.length > 0 && (
                        <div className="pl-2 space-y-1.5">
                          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block">Sources Cited</span>
                          <div className="flex flex-wrap gap-2">
                            {m.citations.map((cit: any, idx: number) => (
                              <div
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-white/[0.01] border border-white/5 text-[9px] text-gray-400 flex items-center gap-1 font-mono hover:border-white/10"
                                title={cit.snippet}
                              >
                                <FileText className="w-3 h-3 text-blue-400" />
                                Citation {cit.citationId} (P. {cit.chunkIndex + 1})
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
                <div className="flex gap-4 max-w-[85%] animate-pulse">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-[#090d16]/50 border-white/5 text-xs leading-relaxed text-gray-200 rounded-tl-none font-light">
                      <div className="whitespace-pre-line">{streamingMessage}</div>
                      <span className="inline-block w-1.5 h-3 bg-blue-500 ml-1 animate-ping" />
                    </div>

                    {/* Citations while streaming */}
                    {streamingCitations.length > 0 && (
                      <div className="pl-2 space-y-1.5">
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block">Retrieving Sources...</span>
                        <div className="flex flex-wrap gap-2">
                          {streamingCitations.map((cit: any, idx: number) => (
                            <div key={idx} className="px-2.5 py-1 rounded-lg bg-white/[0.01] border border-white/5 text-[9px] text-gray-500 flex items-center gap-1 font-mono">
                              <FileText className="w-3 h-3 text-blue-500/70" />
                              Citation {cit.citationId} (P. {cit.chunkIndex + 1})
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
        <form onSubmit={(e) => handleSendMessage(e)} className="p-4 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3 bg-white/[0.01] border border-white/5 focus-within:border-blue-500/40 rounded-2xl px-4 py-3 transition-all duration-300">
            <input
              type="text"
              disabled={isStreaming}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isStreaming ? 'Generating agentic response...' : 'Ask a contract question... (e.g. Is there any late fee penalty?)'}
              className="flex-1 bg-transparent border-none text-white text-xs outline-none placeholder-gray-500 disabled:text-gray-600"
            />
            
            <button
              type="submit"
              disabled={!inputMessage.trim() || isStreaming}
              className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 text-white flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-[1.05]"
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
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs uppercase tracking-widest font-bold">Connecting discussion thread...</span>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
