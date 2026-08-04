'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  MessageSquare, Send, Bot, User, Loader2, Sparkles,
  Cpu, Zap, FileText, Plus, HelpCircle, Edit2, Trash2, Check, X,
  Copy, Download, RefreshCw, Search
} from 'lucide-react';
import { Suspense } from 'react';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';

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
  const [searchThread, setSearchThread] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Model info
  const [model] = useState('llama-3.3-70b-versatile');
  const [latency, setLatency] = useState<number | null>(null);
  const [tokenUsage, setTokenUsage] = useState<{ prompt: number; completion: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
          loadConversationDetails(selectIdAfter);
        } else if (list.length > 0 && !activeConversation) {
          loadConversationDetails(list[0].id);
        }
      })
      .catch((err) => {
        console.error('Fetch conversations failed:', err);
        setLoadingConv(false);
      });
  };

  const loadConversationDetails = (convId: string) => {
    fetch(`/api/conversations/${convId}`)
      .then(res => res.json())
      .then(data => {
        if (data.conversation) {
          setActiveConversation(data.conversation);
          const history = data.conversation.messages || [];
          setMessages(history);
          
          if (data.conversation.contractId) {
            setSelectedContractId(data.conversation.contractId);
          }

          // Populate suggestions from metadata of the last assistant response
          const lastAssistantMsg = [...history].reverse().find(m => m.role === 'assistant');
          if (lastAssistantMsg?.metadata?.suggestions) {
            setActiveSuggestions(lastAssistantMsg.metadata.suggestions);
          } else {
            setActiveSuggestions([
              "Summarize my contract",
              "Show high-risk clauses",
              "Identify payment obligations"
            ]);
          }
        }
      })
      .catch(err => console.error('Load thread detail error:', err));
  };

  const handleSelectConversation = (conv: any) => {
    loadConversationDetails(conv.id);
  };

  const handleStartNewChat = () => {
    setActiveConversation(null);
    setMessages([]);
    setStreamingMessage('');
    setStreamingCitations([]);
    setLatency(null);
    setTokenUsage(null);
    setActiveSuggestions([
      "Summarize my contract",
      "Show high-risk clauses",
      "Identify payment obligations"
    ]);
  };

  const handleStartRename = (conv: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = async (id: string, e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editingTitle.trim()) return;

    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.conversation) {
        setConversations(prev => prev.map(c => c.id === id ? { ...c, title: data.conversation.title } : c));
        if (activeConversation?.id === id) {
          setActiveConversation((prev: any) => prev ? { ...prev, title: data.conversation.title } : null);
        }
      }
    } catch (err) {
      console.error('Rename conversation failed:', err);
    } finally {
      setEditingId(null);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this discussion thread?')) return;

    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (activeConversation?.id === id) {
          setActiveConversation(null);
          setMessages([]);
          setActiveSuggestions([
            "Summarize my contract",
            "Show high-risk clauses",
            "Identify payment obligations"
          ]);
        }
      }
    } catch (err) {
      console.error('Delete conversation failed:', err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const textToSend = directText || inputMessage;
    if (!textToSend.trim() || isStreaming) return;

    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Add user message locally for immediate UI response
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
      let createdConvId = activeConversation?.id;

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
              setActiveSuggestions(metaData.suggestions || []);
              createdConvId = metaData.conversationId;
              
              if (!activeConversation && createdConvId) {
                fetchConversations(createdConvId);
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

      const targetId = activeConversation?.id || createdConvId;
      if (targetId) {
        loadConversationDetails(targetId);
        fetchConversations(targetId);
      }
      setStreamingMessage('');
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: 'An error occurred while connecting to the AI chat service. Please try sending your message again.',
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleExportMarkdown = () => {
    if (messages.length === 0) return;
    const threadTitle = activeConversation?.title || 'LegalQA_Discussion';
    let mdContent = `# ${threadTitle}\n*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

    messages.forEach((m) => {
      const speaker = m.role === 'user' ? '👤 User' : '🤖 LegalQA AI';
      mdContent += `### ${speaker}\n${m.content}\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${threadTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    if (isStreaming || messages.length === 0) return;
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      handleSendMessage(undefined, lastUserMessage.content);
    }
  };

  const handleSuggestionClick = (promptText: string) => {
    handleSendMessage(undefined, promptText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchThread.toLowerCase()) ||
    (c.messages && c.messages.some((m: any) => m.content.toLowerCase().includes(searchThread.toLowerCase())))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0 items-stretch animate-fade-in">
      {/* Sidebar Panel: Conversation History */}
      <div className="lg:col-span-1 glass-card rounded-2xl p-4 flex flex-col justify-between flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          <button
            onClick={handleStartNewChat}
            className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/15 text-blue-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Discussion
          </button>

          {/* Search Conversations Input */}
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search threads..."
              value={searchThread}
              onChange={(e) => setSearchThread(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.02] border border-white/5 focus:border-blue-500/30 rounded-xl text-white outline-none placeholder-gray-500"
            />
          </div>

          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1 shrink-0">Discussion Threads</h3>
          
          {loadingConv ? (
            <div className="text-center py-6 text-xs text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Loading threads...
            </div>
          ) : filteredConversations.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-6">No threads found.</p>
          ) : (
            <div className="space-y-1 overflow-y-auto flex-1 pr-1">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`group relative p-2 rounded-xl cursor-pointer text-left text-xs transition flex items-center justify-between gap-2 ${
                    activeConversation?.id === conv.id
                      ? 'bg-blue-600/10 border border-blue-500/15 text-blue-400 font-semibold'
                      : 'hover:bg-white/[0.02] border border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(conv.id, e)}
                        autoFocus
                        className="flex-1 bg-white/10 border border-blue-500/30 rounded-lg px-2 py-1 text-xs text-white outline-none"
                      />
                      <button
                        onClick={(e) => handleSaveRename(conv.id, e)}
                        className="p-1 hover:text-emerald-400 text-gray-400 transition cursor-pointer"
                        title="Save Rename"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                        className="p-1 hover:text-red-400 text-gray-400 transition cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 text-blue-400/80" />
                        <span className="truncate">{conv.title}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                        <button
                          onClick={(e) => handleStartRename(conv, e)}
                          className="p-1 hover:text-blue-400 text-gray-400 rounded hover:bg-white/5 transition cursor-pointer"
                          title="Rename Thread"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="p-1 hover:text-red-400 text-gray-400 rounded hover:bg-white/5 transition cursor-pointer"
                          title="Delete Thread"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mapped Contract Context */}
        <div className="border-t border-white/5 pt-4 mt-4 shrink-0">
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Attached Context</label>
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="w-full px-2.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/10 text-white outline-none cursor-pointer hover:border-white/20 transition-colors"
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
      <div className="lg:col-span-3 glass-panel rounded-2xl border-white/5 flex flex-col justify-between flex-1 min-h-0 overflow-hidden">
        {/* Chat Feed Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/15 flex items-center justify-center text-blue-400 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                {activeConversation?.title || 'LegalQA AI Intelligence Agent'}
              </h3>
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold block mt-0.5">
                {selectedContractId ? 'Attached Document RAG Active' : 'Autonomous Legal Intelligence OS'}
              </span>
            </div>
          </div>

          {/* Controls & Export */}
          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <>
                <button
                  onClick={handleExportMarkdown}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                  title="Export Discussion as Markdown"
                >
                  <Download className="w-3 h-3 text-blue-400" /> Export
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isStreaming}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition cursor-pointer disabled:opacity-50"
                  title="Regenerate Last Response"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin' : ''}`} />
                </button>
              </>
            )}

            <div className="flex items-center gap-3 text-[9px] text-gray-500 font-mono border-l border-white/5 pl-3">
              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-gray-500" /> {model}</span>
              {latency && <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-500" /> {latency}ms</span>}
            </div>
          </div>
        </div>

        {/* Message history with Rich Markdown */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !streamingMessage ? (
            <div className="flex flex-col justify-center items-center h-full max-w-lg mx-auto py-10 text-center space-y-6">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-center text-blue-400 mx-auto shadow-inner">
                  <Sparkles className="w-6 h-6 animate-pulse text-blue-400" />
                </div>
                <h4 className="text-xl font-bold text-white font-display">Enterprise Legal Intelligence</h4>
                <p className="text-xs leading-relaxed text-gray-400 font-light">
                  Initiate audit discussions. Query liabilities, notice bounds, and payment structures directly in natural language with persistent multi-turn memory.
                </p>
              </div>

              {/* Categorized suggestions for Empty State */}
              <div className="space-y-4 w-full mt-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category 1: Summary & Obligations */}
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Contract Analysis</h5>
                    <button
                      onClick={() => handleSuggestionClick("Summarize my contract")}
                      className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-xs text-gray-300 transition cursor-pointer hover:border-white/10"
                    >
                      Summarize my contract
                    </button>
                    <button
                      onClick={() => handleSuggestionClick("Identify payment obligations")}
                      className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-xs text-gray-300 transition cursor-pointer hover:border-white/10"
                    >
                      Identify payment obligations
                    </button>
                  </div>

                  {/* Category 2: Risks & Compliance */}
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Risks & Compliance</h5>
                    <button
                      onClick={() => handleSuggestionClick("Show high-risk clauses")}
                      className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-xs text-gray-300 transition cursor-pointer hover:border-white/10"
                    >
                      Show high-risk clauses
                    </button>
                    <button
                      onClick={() => handleSuggestionClick("Identify compliance risks")}
                      className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-xs text-gray-300 transition cursor-pointer hover:border-white/10"
                    >
                      Identify compliance risks
                    </button>
                  </div>

                  {/* Category 3: Clause Review & Comparison */}
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2 md:col-span-2">
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Clause Review</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        onClick={() => handleSuggestionClick("Explain the indemnity clause")}
                        className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-xs text-gray-300 transition cursor-pointer hover:border-white/10"
                      >
                        Explain the indemnity clause
                      </button>
                      <button
                        onClick={() => handleSuggestionClick("Compare two agreements")}
                        className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-xs text-gray-300 transition cursor-pointer hover:border-white/10"
                      >
                        Compare two agreements
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m, idx) => {
                const isUser = m.role === 'user';
                const isLastMessage = idx === messages.length - 1;
                return (
                  <div key={m.id} className="space-y-3">
                    <div className={`flex gap-4 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center border shadow-md ${
                        isUser 
                          ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
                          : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
                      }`}>
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      <div className="space-y-2 flex-1 min-w-0">
                        <div className={`p-4 rounded-2xl border text-xs leading-relaxed shadow-sm relative group ${
                          isUser 
                            ? 'bg-blue-600/10 border-blue-500/15 text-white rounded-tr-none' 
                            : 'bg-[#090d16]/60 border-white/5 text-gray-200 rounded-tl-none font-light'
                        }`}>
                          {/* Copy button */}
                          <button
                            onClick={() => handleCopyMessage(m.content, m.id)}
                            className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white rounded bg-white/5 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            title="Copy Message"
                          >
                            {copiedMsgId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {isUser ? (
                            <div className="whitespace-pre-wrap">{m.content}</div>
                          ) : (
                            <MarkdownRenderer content={m.content} />
                          )}
                        </div>

                        {/* Message citations */}
                        {m.citations && m.citations.length > 0 && (
                          <div className="pl-2 space-y-1.5">
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block">Sources Cited</span>
                            <div className="flex flex-wrap gap-2">
                              {m.citations.map((cit: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-white/[0.01] border border-white/5 text-[9px] text-blue-300 flex items-center gap-1.5 font-mono hover:border-blue-500/30 transition shadow-sm"
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

                    {/* Contextual Suggestions below the last AI message */}
                    {!isUser && isLastMessage && activeSuggestions.length > 0 && !isStreaming && (
                      <div className="flex flex-wrap gap-2 pl-12 animate-fade-in my-3">
                        {activeSuggestions.map((s, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSuggestionClick(s)}
                            className="px-3 py-1.5 text-[11px] rounded-xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/15 hover:border-blue-500/30 text-blue-400 font-medium transition cursor-pointer hover:scale-[1.02]"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Progressive Streaming State */}
          {isStreaming && (
            <div className="flex gap-4 max-w-[88%] mt-4">
              <div className="h-8 w-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="space-y-3 flex-1">
                <div className="p-4 rounded-2xl bg-[#090d16]/60 border border-blue-500/10 text-xs leading-relaxed text-gray-200 rounded-tl-none">
                  {streamingMessage ? (
                    <>
                      <MarkdownRenderer content={streamingMessage} />
                      <span className="inline-block w-1.5 h-3.5 bg-blue-400 ml-1 animate-ping" />
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-blue-400 font-mono text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      <span className="uppercase tracking-widest font-bold text-[10px] animate-pulse">
                        {selectedContractId ? 'Analyzing Contract Context...' : 'Thinking...'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Citations while streaming */}
                {streamingCitations.length > 0 && (
                  <div className="pl-2 space-y-1.5">
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block">Retrieving Contract Chunks...</span>
                    <div className="flex flex-wrap gap-2">
                      {streamingCitations.map((cit: any, idx: number) => (
                        <div key={idx} className="px-2.5 py-1 rounded-lg bg-white/[0.01] border border-white/5 text-[9px] text-gray-400 flex items-center gap-1 font-mono">
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
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form with Growing Textarea */}
        <form onSubmit={(e) => handleSendMessage(e)} className="p-4 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-end gap-3 bg-white/[0.01] border border-white/5 focus-within:border-blue-500/40 rounded-2xl px-4 py-3 transition-all duration-300">
            <textarea
              ref={textareaRef}
              rows={1}
              disabled={isStreaming}
              value={inputMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={isStreaming ? 'Analyzing and generating response...' : 'Ask a legal or contract question... (Shift+Enter for new line)'}
              className="flex-1 bg-transparent border-none text-white text-xs outline-none placeholder-gray-500 disabled:text-gray-600 resize-none max-h-32 min-h-[20px] py-0.5"
            />
            
            <button
              type="submit"
              disabled={!inputMessage.trim() || isStreaming}
              className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 text-white flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-[1.05] shrink-0"
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
        <span className="text-xs uppercase tracking-widest font-bold">Connecting AI discussion workspace...</span>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
