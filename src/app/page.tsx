'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, MessageSquare, Split, ArrowRight, Sparkles,
  FileText, AlertTriangle, Cpu, Zap, Calendar, Play, CheckCircle2,
  Lock, LayoutDashboard, Search, Database, Layers, ArrowUpRight
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'chat' | 'compare' | 'analytics'>('audit');

  const tabs = [
    { id: 'audit', label: 'Risk Auditor', icon: ShieldCheck },
    { id: 'chat', label: 'AI Document RAG', icon: MessageSquare },
    { id: 'compare', label: 'Clause Compare', icon: Split },
    { id: 'analytics', label: 'Performance Analytics', icon: LayoutDashboard }
  ];

  return (
    <div className="relative min-h-screen text-gray-100 overflow-hidden font-sans select-none pb-24">
      {/* Background layer with noise texture */}
      <div className="os-background" />

      {/* Dynamic Animated Aurora Fields */}
      <div className="absolute top-[10%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-blue-900/10 blur-[150px] animate-aurora-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-indigo-900/10 blur-[150px] animate-aurora-slower pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-purple-950/5 blur-[120px] pointer-events-none animate-aurora-slow" />

      {/* Center Floating Dock Navigation (Apple Inspired) */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="glass-panel px-6 py-3 rounded-full flex items-center justify-between gap-12 w-full max-w-4xl shadow-2xl border-white/5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-display font-bold text-sm text-white">L</span>
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-white">Legal<span className="text-blue-400">QA</span></span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Workspace</Link>
            <span className="text-gray-800">|</span>
            <span className="text-blue-400 flex items-center gap-1"><Zap className="w-3 h-3" /> Groq Tier</span>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-gray-300 hover:text-white transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full hover:bg-gray-200 transition-all shadow-md">
              Deploy OS
            </Link>
          </div>
        </nav>
      </div>

      {/* Cinematic Hero fold */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-36 text-center space-y-8">
        
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-blue-300 backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-blue-400" />
          LegalQA 2.0 • Powered by Groq Cloud Ingestion
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
          The Legal Intelligence <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
            Operating System.
          </span>
        </h1>

        {/* Value Proposition */}
        <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-400 font-light leading-relaxed">
          Upload multi-page agreements. Detect liabilities instantly. Compare audit changes side-by-side. 
          Prompt document databases with native RAG vector searches on an Apple VisionOS-inspired workspace.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
          <Link href="/signup" className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02]">
            Start Free Trial
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all backdrop-blur-md hover:scale-[1.02]">
            Enter Workspace
          </Link>
        </div>

        {/* Interactive 3D-Style Dashboard Simulator */}
        <div className="relative pt-12 max-w-5xl mx-auto perspective-1000">
          
          {/* Floating Badges */}
          <div className="absolute top-10 left-[-30px] z-20 hidden lg:block glass-panel px-4 py-3 rounded-2xl border-white/5 shadow-2xl animate-aurora-slow flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div className="text-left">
              <span className="text-[8px] uppercase font-bold text-gray-500 block">Ingestion Speed</span>
              <span className="text-xs font-bold text-white font-mono">600 Pages / Min</span>
            </div>
          </div>

          <div className="absolute bottom-20 right-[-40px] z-20 hidden lg:block glass-panel px-4 py-3 rounded-2xl border-white/5 shadow-2xl animate-aurora-slower flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Cpu className="w-4.5 h-4.5" />
            </div>
            <div className="text-left">
              <span className="text-[8px] uppercase font-bold text-gray-500 block">LLM Inference</span>
              <span className="text-xs font-bold text-white font-mono">1.1s Latency</span>
            </div>
          </div>

          {/* Simulator Wrapper Frame */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.01] p-4 backdrop-blur-2xl shadow-3xl rotate-x-12 rotate-x-hover rotate-x-hover:hover rotate-x-hover transition-all duration-700 select-none">
            
            {/* Top Mockup Header */}
            <div className="flex flex-col md:flex-row justify-between items-center px-4 pb-4 border-b border-white/5 gap-4">
              {/* Window dots */}
              <div className="flex items-center gap-2 self-start md:self-auto pt-1">
                <div className="w-3 h-3 rounded-full bg-red-500/30" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
                <div className="w-3 h-3 rounded-full bg-green-500/30" />
              </div>

              {/* Tab Selector Links */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#090d16]/60 border border-white/5">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/15 shadow-sm'
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="hidden md:block text-[10px] text-gray-500 font-mono">legalqa-preview-v2.0.io</div>
            </div>

            {/* Simulated Workspace Viewport */}
            <div className="p-4 text-left min-h-[360px] flex flex-col justify-between">
              
              {/* Panel 1: Audit Hub */}
              {activeTab === 'audit' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                  {/* Gauge */}
                  <div className="rounded-xl bg-[#090d16]/80 border border-white/5 p-6 flex flex-col items-center text-center justify-between">
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Calculated Risk Index</span>
                    <div className="relative h-24 w-24 flex items-center justify-center my-2">
                      <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.02)" strokeWidth="5" fill="transparent" />
                        <circle cx="48" cy="48" r="40" stroke="#f59e0b" strokeWidth="5" fill="transparent" strokeDasharray={2*Math.PI*40} strokeDashoffset={2*Math.PI*40 * 0.65} />
                      </svg>
                      <span className="text-2xl font-extrabold text-white">35%</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/25 font-bold uppercase tracking-wider">MODERATE RISK</span>
                  </div>

                  {/* Summary */}
                  <div className="md:col-span-2 rounded-xl bg-[#090d16]/80 border border-white/5 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest block">Executive Summary</span>
                        <span className="text-[9px] text-gray-500 font-mono uppercase">Version 2.4</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed font-light">
                        "The agreement outlines basic service level agreements for server infrastructure. Section 8.4 contains an indemnification clause for server downtime that is currently unlimited. Recommend adding a reciprocal cap of 12-months hosting fees."
                      </p>
                    </div>
                    <div className="border-t border-white/5 pt-3 mt-4 flex justify-between items-center text-[9px] text-gray-500 font-mono">
                      <span>Effective: 2026-08-01</span>
                      <span className="text-blue-400 font-semibold cursor-pointer flex items-center gap-1">Open Full Auditor <ArrowUpRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Panel 2: AI Chat RAG */}
              {activeTab === 'chat' && (
                <div className="space-y-4 animate-fade-in flex flex-col justify-between min-h-[320px]">
                  {/* Messages Feed */}
                  <div className="space-y-3 flex-1 max-h-[220px] overflow-y-auto pr-1">
                    {/* User */}
                    <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse text-right">
                      <div className="h-6 w-6 rounded bg-blue-600/15 border border-blue-500/25 text-blue-400 flex items-center justify-center text-[10px] font-bold">U</div>
                      <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/10 text-[11px] text-white">
                        Is there an early termination penalty?
                      </div>
                    </div>

                    {/* Assistant */}
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="h-6 w-6 rounded bg-indigo-600/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center text-[10px] font-bold"><Bot className="w-3 h-3" /></div>
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-xl bg-[#090d16]/70 border border-white/5 text-[11px] text-gray-300 leading-relaxed font-light">
                          Yes. Under Section 12.3, either party can terminate early with 90 days written notice. However, if the client terminates, they forfeit the security deposit.
                        </div>
                        {/* Citations */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] uppercase tracking-wider font-bold text-gray-600">Citation Map:</span>
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] text-gray-400 font-mono flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5 text-blue-400" /> Section 12.3 (Page 4)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Simulation */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.01] border border-white/5">
                    <input
                      type="text"
                      disabled
                      placeholder="Ask the contract database... (e.g. limit of liability)"
                      className="flex-1 bg-transparent border-none text-[11px] text-white outline-none placeholder-gray-500"
                    />
                    <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center text-white"><Send className="w-3 h-3 fill-white" /></div>
                  </div>
                </div>
              )}

              {/* Panel 3: Compare Diff */}
              {activeTab === 'compare' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contract A */}
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Reference v1</span>
                      <p className="p-3 rounded-lg bg-[#090d16]/60 border border-white/5 text-[10px] text-gray-400 font-mono leading-relaxed">
                        "The service provider guarantees 99.5% network uptime monthly, excluding scheduled maintenance outages."
                      </p>
                    </div>

                    {/* Contract B */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Proposed v2</span>
                        <span className="px-2 py-0.5 rounded text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 font-bold">RISK INCREASE</span>
                      </div>
                      <p className="p-3 rounded-lg bg-[#090d16]/60 border border-white/5 text-[10px] text-gray-400 font-mono leading-relaxed">
                        "The service provider guarantees <span className="bg-red-950 text-red-400 px-1 py-0.5 rounded">- 99.0%</span> network uptime monthly, including scheduled maintenance outages."
                      </p>
                    </div>
                  </div>

                  {/* Diff Analysis */}
                  <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 text-[10px] text-gray-400 leading-relaxed flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block mb-0.5">Uptime SLA Decreased</span>
                      <span className="font-light leading-relaxed">Uptime reduction exposes the client organization to greater operational downtime risks without penalty triggers.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Panel 4: Analytics */}
              {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in pt-4">
                  {/* Sparkline counter */}
                  <div className="p-5 rounded-xl bg-[#090d16]/80 border border-white/5 flex flex-col justify-between min-h-[140px]">
                    <div>
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Ingestion Efficiency</span>
                      <h4 className="text-2xl font-extrabold text-white font-display mt-1">185.4 Hours Saved</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-emerald-400 font-semibold font-mono">
                      <Sparkles className="w-3.5 h-3.5" /> +15.2% Velocity improvement
                    </div>
                  </div>

                  {/* Sparkline counter 2 */}
                  <div className="p-5 rounded-xl bg-[#090d16]/80 border border-white/5 flex flex-col justify-between min-h-[140px]">
                    <div>
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Auditing Compliance</span>
                      <h4 className="text-2xl font-extrabold text-white font-display mt-1">97.8% Accuracy</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-blue-400 font-semibold font-mono">
                      <Cpu className="w-3.5 h-3.5" /> Checked against 15+ template benchmarks
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Statistics Fold */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.01] py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <span className="block text-3xl font-extrabold text-white font-display">142,852</span>
            <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-bold">Contracts Analyzed</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl font-extrabold text-blue-400 font-display">28,910</span>
            <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-bold">Risks Highlighted</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl font-extrabold text-indigo-400 font-display">185,400</span>
            <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-bold">Compliance Hours Saved</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5 mt-12">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center">
            <span className="font-display font-bold text-xs text-white">L</span>
          </div>
          <span className="text-xs text-gray-500 font-light">© 2026 LegalQA Intelligence OS. All rights reserved.</span>
        </div>
        <div className="flex gap-6 text-xs text-gray-400">
          <Link href="/login" className="hover:text-white transition-colors duration-200">Sign In</Link>
          <Link href="/signup" className="hover:text-white transition-colors duration-200">Sign Up</Link>
          <span className="text-gray-700">|</span>
          <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-600 font-mono">v2.0.0</span>
        </div>
      </footer>
    </div>
  );
}

// Local simulation support icons
function Bot(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function Send(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
