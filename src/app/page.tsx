'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles, Zap, ArrowRight, Play, ShieldCheck,
  FileText, MessageSquare, GitCompare, Search, Rocket
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-gray-100 overflow-hidden font-sans">
      {/* Background layer with noise texture */}
      <div className="os-background" />

      {/* ──────────── TOP NAVIGATION BAR ──────────── */}
      <nav className="relative z-50 w-full px-6 md:px-12 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center">
            <span className="font-display font-bold text-xs text-white">L</span>
          </div>
          <span className="font-display font-semibold text-base tracking-tight text-white">LegalQA</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
            Workspace <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block">Sign In</Link>
          <Link href="/signup" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/25">
            Deploy OS
          </Link>
        </div>
      </nav>

      {/* ──────────── HERO SECTION ──────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-0 text-center flex flex-col items-center">

        {/* Release Pill */}
        <div className="relative z-20 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-300 backdrop-blur-md mb-8">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          The Spatial Contract Intelligence System
        </div>

        {/* Hero Content */}
        <div className="relative w-full max-w-4xl z-20">

          {/* Headline */}
          <h1 className="font-display text-[2.5rem] sm:text-[3.2rem] md:text-[3.8rem] font-extrabold tracking-[-0.02em] text-white leading-[1.1] max-w-3xl mx-auto mb-5">
            The Legal Intelligence<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Operating System
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-lg mx-auto text-sm text-gray-400 font-light leading-relaxed mb-8">
            Unlock the power of AI for your legal documents. Instant liability detection,
            precise clause extraction, and intuitive RAG vector searches within a
            revolutionary spatial workspace.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <Link href="/signup" className="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-full shadow-[0_0_30px_rgba(59,130,246,0.35)] transition-all duration-300 flex items-center gap-2 hover:scale-[1.02]">
              Deploy Your OS
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#demo" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors group">
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                <Play className="w-3 h-3 fill-white" />
              </div>
              Book a Demo
            </Link>
          </div>
        </div>

        {/* ──────────── DASHBOARD PREVIEW ──────────── */}
        <div className="relative w-full max-w-[60rem]">
          <div className="relative z-10">
            <Image
              src="/dashboard-preview.png"
              alt="LegalQA Dashboard - AI Contract Analysis with Risk Scoring, Clause Extraction, and RAG Chat"
              width={1024}
              height={412}
              className="w-full h-auto mx-auto"
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse 82% 78% at 50% 50%, rgba(0,0,0,1) 32%, rgba(0,0,0,0) 82%)',
                maskImage: 'radial-gradient(ellipse 82% 78% at 50% 50%, rgba(0,0,0,1) 32%, rgba(0,0,0,0) 82%)',
              }}
              unoptimized
              priority
            />
          </div>
        </div>

      </section>

      {/* ──────────── STATS BAR ──────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {[
            { icon: Sparkles, value: '98.6%', label: 'Risk Detection Accuracy' },
            { icon: FileText, value: '250K+', label: 'Contracts Analyzed' },
            { icon: Zap, value: '1,200+', label: 'Legal Teams Trust Us' },
            { icon: Rocket, value: '20x', label: 'Faster Contract Review' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-1">
                <stat.icon className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <span className="text-2xl md:text-3xl font-display font-bold text-white">{stat.value}</span>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────── FEATURES SECTION ──────────── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-300 mb-5">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Powered by Next-Gen AI
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need to master contracts
          </h2>
          <p className="text-sm text-gray-400 font-light max-w-lg mx-auto">
            AI that understands legal language, context, and your business.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: ShieldCheck, title: 'AI Risk Analysis', desc: 'Detect high-risk clauses, liabilities, and compliance issues instantly.', color: 'from-blue-500 to-blue-700' },
            { icon: FileText, title: 'Clause Extraction', desc: 'Extract and categorize important clauses with 100% precision.', color: 'from-indigo-500 to-indigo-700' },
            { icon: MessageSquare, title: 'AI Contract Chat', desc: 'Ask questions. Get answers. Chat with your documents in natural language.', color: 'from-purple-500 to-purple-700' },
            { icon: GitCompare, title: 'Smart Comparison', desc: 'Compare contracts side-by-side and spot differences in seconds.', color: 'from-cyan-500 to-cyan-700' },
            { icon: Search, title: 'Advanced Search', desc: 'RAG-powered semantic search across your entire contract library.', color: 'from-blue-400 to-indigo-600' },
          ].map((feature) => (
            <div key={feature.title} className="bg-[#0a1630]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-300 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-2">{feature.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────── CTA FOOTER ──────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a1630] to-[#0f1d3d] border border-white/[0.08] p-10 md:p-14">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                Ready to deploy your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Legal Intelligence OS?</span>
              </h3>
              <p className="text-sm text-gray-400">Join the future of legal workspace.</p>
            </div>
            <Link href="/signup" className="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.35)] transition-all duration-300 flex items-center gap-2 hover:scale-[1.02] whitespace-nowrap">
              Deploy Your OS <Rocket className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────── FOOTER ──────────── */}
      <footer className="relative z-10 py-8 max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center">
            <span className="font-display font-bold text-[8px] text-white">L</span>
          </div>
          <span className="text-[11px] text-gray-500 font-light">© 2026 LegalQA Intelligence OS. All rights reserved.</span>
        </div>
        <div className="flex gap-5 text-[11px] text-gray-400 font-light">
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          <span className="text-gray-700">|</span>
          <span className="text-[9px] bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded text-gray-600 font-mono">v2.0.0</span>
        </div>
      </footer>
    </div>
  );
}
