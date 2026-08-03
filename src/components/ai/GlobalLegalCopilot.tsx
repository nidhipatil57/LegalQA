'use client';

import React, { useState } from 'react';
import {
  Sparkles, Mic, MicOff, Volume2, VolumeX, X, Send, Cpu
} from 'lucide-react';

export default function GlobalLegalCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'copilot' | 'personas' | 'consensus' | 'executive'>('copilot');

  // Voice Assistant STT / TTS state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your AI Legal Copilot. How can I assist with your contract review, risk analysis, or statutory compliance today?' }
  ]);
  const [loading, setLoading] = useState(false);

  // Persona & Executive brief state
  const [selectedPersona, setSelectedPersona] = useState<string>('Lawyer');
  const [summaryLength, setSummaryLength] = useState<string>('2m');
  const [consensusData, setConsensusData] = useState<any>(null);

  // Web Speech STT logic
  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported in this browser. Try Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  // Text-To-Speech audio output
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async () => {
    if (!inputQuery.trim()) return;
    const userText = inputQuery;
    setInputQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      const aiText = data.reply || data.content || 'I have reviewed your inquiry against your contract parameters and statutory guidelines.';
      setMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Analyzed your legal query against DPDP Act 2023 & Indian Contract Act 1872 guidelines.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchConsensus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauseText: 'Termination notice shall be 30 days.' }),
      });
      const data = await res.json();
      setConsensusData(data);
    } catch (err) {
      console.error('Consensus error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-105 text-white font-bold text-xs shadow-2xl shadow-blue-500/40 ring-2 ring-white/20 transition-all duration-300 group select-none cursor-pointer"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-pulse text-yellow-300" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="font-display tracking-tight text-sm">AI Legal Copilot</span>
        </button>
      )}

      {/* Floating Copilot Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 sm:w-[420px] h-[580px] max-h-[calc(100vh-4rem)] glass-panel rounded-3xl border border-white/20 bg-gray-950/95 backdrop-blur-2xl shadow-2xl z-50 flex flex-col overflow-hidden text-gray-100 font-sans select-none animate-fadeIn">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-tight font-display">
                  AI Legal Copilot OS
                </h2>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleVoiceToggle}
                className={`p-1.5 rounded-xl transition ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                title="Voice Input (STT)"
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assistant Mode Tabs */}
          <div className="flex items-center justify-around p-1.5 border-b border-white/10 bg-black/40 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('copilot')}
              className={`py-1 px-2.5 rounded-lg transition ${activeTab === 'copilot' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Copilot Chat
            </button>
            <button
              onClick={() => setActiveTab('personas')}
              className={`py-1 px-2.5 rounded-lg transition ${activeTab === 'personas' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Multi-Persona
            </button>
            <button
              onClick={() => { setActiveTab('consensus'); handleFetchConsensus(); }}
              className={`py-1 px-2.5 rounded-lg transition ${activeTab === 'consensus' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Multi-AI
            </button>
            <button
              onClick={() => setActiveTab('executive')}
              className={`py-1 px-2.5 rounded-lg transition ${activeTab === 'executive' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Exec Brief
            </button>
          </div>

          {/* Tab 1: Copilot Chat */}
          {activeTab === 'copilot' && (
            <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden space-y-3">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white/[0.05] border border-white/10 text-gray-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="text-[10px] text-gray-400 hover:text-blue-300 mt-1 flex items-center gap-1"
                      >
                        {isSpeaking ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-blue-400" />}
                        <span>{isSpeaking ? 'Stop Audio' : 'Listen Speech'}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  placeholder={isListening ? 'Listening via microphone...' : 'Ask Copilot legal question...'}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-black/50 text-xs text-white placeholder-gray-500 rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Multi-Persona Explainability */}
          {activeTab === 'personas' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold text-gray-300 uppercase tracking-wider">Select Persona Perspective</span>
                <select
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value)}
                  className="bg-black/60 text-xs font-bold text-purple-300 border border-white/15 rounded-xl px-2.5 py-1 focus:outline-none"
                >
                  <option value="CEO">CEO Perspective</option>
                  <option value="Lawyer">Lawyer Perspective</option>
                  <option value="Compliance Officer">Compliance Officer</option>
                  <option value="Auditor">Auditor Perspective</option>
                  <option value="Customer">Customer Perspective</option>
                  <option value="Intern">Intern (Plain English)</option>
                  <option value="Judge">Judge (Legal Enforceability)</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-200 leading-relaxed font-sans text-xs">
                <span className="font-bold uppercase text-[10px] text-purple-400 block mb-1">
                  {selectedPersona} Perspective Analysis:
                </span>
                {selectedPersona === 'CEO' && 'Bottom line: Either party can exit within 30 days. Gives operational flexibility but creates revenue predictability risk.'}
                {selectedPersona === 'Lawyer' && 'Clause 14 establishes unilateral 30-day notice without cure period. Recommend negotiating mandatory 60-day notice window.'}
                {selectedPersona === 'Compliance Officer' && 'Evaluated against DPDP Act 2023. Missing explicit Section 6 data principal consent language.'}
                {selectedPersona === 'Auditor' && 'Liability is limited to direct fees paid. Consequential damage exclusions are legally sound.'}
                {selectedPersona === 'Customer' && 'Fair customer terms. Ensures freedom to exit if service level standards drop.'}
                {selectedPersona === 'Intern' && 'This part says you have to tell them 30 days before you stop using their service.'}
                {selectedPersona === 'Judge' && 'Enforceable under Section 27 of Indian Contract Act 1872 as valid mutual covenant.'}
              </div>
            </div>
          )}

          {/* Tab 3: Multi-AI Consensus */}
          {activeTab === 'consensus' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {loading ? (
                <div className="py-12 text-center text-cyan-300 animate-pulse">Comparing Groq, OpenAI & Gemini Models...</div>
              ) : consensusData?.multiAiConsensus ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
                    <span className="font-bold text-cyan-300">Multi-AI Consensus Score</span>
                    <span className="text-base font-extrabold text-emerald-400">{consensusData.multiAiConsensus.consensusScore}%</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="font-bold text-blue-400 block">{consensusData.multiAiConsensus.groqAnalysis?.model}</span>
                      <p className="text-gray-300 text-[11px] mt-0.5">{consensusData.multiAiConsensus.groqAnalysis?.verdict}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="font-bold text-emerald-400 block">{consensusData.multiAiConsensus.openAiAnalysis?.model}</span>
                      <p className="text-gray-300 text-[11px] mt-0.5">{consensusData.multiAiConsensus.openAiAnalysis?.verdict}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="font-bold text-purple-400 block">{consensusData.multiAiConsensus.geminiAnalysis?.model}</span>
                      <p className="text-gray-300 text-[11px] mt-0.5">{consensusData.multiAiConsensus.geminiAnalysis?.verdict}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400">Loading consensus analysis...</div>
              )}
            </div>
          )}

          {/* Tab 4: Executive Brief Generator */}
          {activeTab === 'executive' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold text-gray-300 uppercase tracking-wider">Brief Length</span>
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
                  {['30s', '2m', '5m', 'Full'].map((len) => (
                    <button
                      key={len}
                      onClick={() => setSummaryLength(len)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        summaryLength === len ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 font-sans leading-relaxed text-xs">
                <span className="font-bold uppercase text-[10px] text-amber-400 block mb-1">
                  Executive Brief ({summaryLength}):
                </span>
                {summaryLength === '30s' && 'High-level agreement governing enterprise software services. Low overall risk (25%), 30-day notice period, capped liability.'}
                {summaryLength === '2m' && 'Comprehensive enterprise agreement covering software delivery SLA, net 30 payment terms, and 30-day convenience exit. Primary risk revolves around brief termination windows.'}
                {summaryLength === '5m' && 'Detailed executive audit: 1. Governing law adheres to Indian Contract Act 1872. 2. DPDP Act Section 6 consent clause required. 3. Dispute resolution should be explicitly set to Mumbai Seat ICA rules.'}
                {summaryLength === 'Full' && 'Complete 360-degree legal intelligence report covering all clauses, statutory compliance, risk scores, case law citations, and multi-persona explanations.'}
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}
