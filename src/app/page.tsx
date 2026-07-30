import Link from 'next/link';
import { ShieldCheck, Zap, MessageSquare, Split, ChevronRight, Award, Clock, ArrowUpRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-gray-100 overflow-hidden font-sans">
      {/* Premium Background Layer */}
      <div className="os-background" />

      {/* Decorative Floating Glowing Orbs */}
      <div className="glow-orb-blue top-[-10%] left-[-10%] opacity-60" />
      <div className="glow-orb-indigo bottom-[-15%] right-[-10%] opacity-40" />
      <div className="glow-orb-blue top-[30%] right-[20%] opacity-20" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-display font-bold text-xl text-white">L</span>
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight text-white">Legal<span className="text-blue-400">QA</span></span>
            <span className="block text-[8px] uppercase tracking-widest text-gray-400 -mt-1 font-semibold">Intelligence OS</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
            Sign In
          </Link>
          <Link href="/signup" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wide text-blue-300 mb-8 backdrop-blur-md">
          <Award className="w-3.5 h-3.5 text-blue-400" />
          Introducing LegalQA 2.0 • Powered by Groq Cloud
        </div>
        
        <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
          Legal Intelligence <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
            Reimagined.
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed font-light">
          Upload contracts. Detect legal risks. Compare clauses. Chat with documents. 
          Review and audit enterprise agreements <span className="text-white font-medium">20x faster</span> with Apple-level design engineering.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-24">
          <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/45 transition-all duration-300 flex items-center justify-center gap-2 group hover:scale-[1.02]">
            Start Free Trial
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/signup" className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-300 backdrop-blur-md hover:scale-[1.02]">
            Book Demo
          </Link>
        </div>

        {/* Floating VisionOS Screenshot Card */}
        <div className="relative max-w-5xl mx-auto rounded-2xl border border-white/10 bg-white/[0.01] p-4 backdrop-blur-2xl shadow-3xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-indigo-500/10 rounded-2xl pointer-events-none" />
          
          {/* Header simulation */}
          <div className="flex justify-between items-center px-4 pb-4 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/30" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
              <div className="w-3 h-3 rounded-full bg-green-500/30" />
            </div>
            <div className="text-xs text-gray-500 font-mono">legalqa-workspace.io</div>
            <div className="w-6" />
          </div>

          {/* Screenshot content layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left p-2">
            <div className="md:col-span-2 rounded-xl bg-[#090d16]/80 border border-white/5 p-6 flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">Smart Analysis</span>
                  <span className="px-2.5 py-1 rounded bg-red-950/40 border border-red-500/30 text-[10px] text-red-400 font-semibold">HIGH RISK</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-display">Liability Cap Omission Detected</h3>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed font-light">
                  "Section 14.2 contains no limitation of liability for the supplier. This leaves the organization exposed to unlimited damages in case of service disruption."
                </p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">Suggested Rewrite: "Liability capped at 12 months fee."</span>
                <span className="text-xs text-blue-400 font-semibold cursor-pointer hover:text-blue-300 transition-colors">Accept Edit</span>
              </div>
            </div>
            
            <div className="rounded-xl bg-[#090d16]/80 border border-white/5 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">Clause Diff</span>
                  <span className="text-xs text-gray-500 font-mono">Compare v1 vs v2</span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="p-2.5 rounded bg-red-950/20 border-l-2 border-red-500 text-xs text-red-300 font-mono">- Net 30 Days</div>
                  <div className="p-2.5 rounded bg-green-950/20 border-l-2 border-green-500 text-xs text-green-300 font-mono">+ Net 60 Days</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-yellow-500 font-semibold">Any Risk Change (+15%)</div>
                <p className="text-xs text-gray-500">Contract B increases cash-flow delay exposure.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.01] py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-2">
            <span className="block text-4xl md:text-5xl font-extrabold text-white font-display">142,852</span>
            <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">Contracts Analyzed</span>
          </div>
          <div className="space-y-2">
            <span className="block text-4xl md:text-5xl font-extrabold text-blue-400 font-display">28,910</span>
            <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">Risks Detected</span>
          </div>
          <div className="space-y-2">
            <span className="block text-4xl md:text-5xl font-extrabold text-indigo-400 font-display">185,400</span>
            <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">Hours Saved</span>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display mb-4">Autonomous Contract Auditing</h2>
          <p className="text-gray-400 max-w-xl mx-auto font-light">Everything you need to review, negotiate, and query agreements with enterprise grade safety.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card rounded-2xl p-8">
            <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-display">Risk Detection Engine</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Identify missing terms, compliance deviations, liability exposure, and early terminations instantly graded by severity.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-2xl p-8">
            <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-sm">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-display">Conversational Legal AI</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Query agreements using natural language. Fetch summary citations and referenced pages mapped to specific clauses.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-2xl p-8">
            <div className="h-12 w-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 shadow-sm">
              <Split className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-display">Clause-by-Clause Compare</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Drop two contracts and view a side-by-side visual diff. Evaluate modifications, additions, and deletions with AI explanations.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display mb-4">Enterprise Grade Pricing</h2>
          <p className="text-gray-400 max-w-xl mx-auto font-light">SaaS operating system tailored for top tier law firms and high-scale corporations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card Professional */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-2">Professional</div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-extrabold text-white font-display">$120</span>
                <span className="text-sm text-gray-400">/ user / mo</span>
              </div>
              <ul className="space-y-3.5 text-sm text-gray-300 mb-8 font-light">
                <li className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-blue-400" /> Up to 50 contracts per month</li>
                <li className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-blue-400" /> Full Risk Analysis & Rewrites</li>
                <li className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-blue-400" /> AI Document Chat & Citations</li>
                <li className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-blue-400" /> Standard Email Support</li>
              </ul>
            </div>
            <Link href="/signup" className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-center transition-all duration-300 hover:scale-[1.02]">
              Start Professional
            </Link>
          </div>

          {/* Card Enterprise */}
          <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between border-blue-500/20 relative">
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-[9px] text-blue-400 font-bold uppercase tracking-wider">
              Recommended
            </div>
            <div>
              <div className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-2">LegalQA OS</div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-extrabold text-white font-display">$500</span>
                <span className="text-sm text-gray-400">/ user / mo</span>
              </div>
              <ul className="space-y-3.5 text-sm text-gray-300 mb-8 font-light">
                <li className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-blue-400" /> Unlimited Contract Uploads</li>
                <li className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-blue-400" /> Multi-Tenant Role Isolation (RBAC)</li>
                <li className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-blue-400" /> Multi-document RAG Semantic Search</li>
                <li className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-blue-400" /> Dedicated API Key Generation</li>
                <li className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-blue-400" /> Priority 24/7 SLA Support</li>
              </ul>
            </div>
            <Link href="/signup" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-center shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02]">
              Deploy Enterprise OS
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center">
            <span className="font-display font-bold text-xs text-white">L</span>
          </div>
          <span className="text-sm text-gray-500">© 2026 LegalQA Intelligence OS. All rights reserved.</span>
        </div>
        <div className="flex gap-6 text-sm text-gray-400">
          <Link href="/login" className="hover:text-white transition-colors duration-200">Sign In</Link>
          <Link href="/signup" className="hover:text-white transition-colors duration-200">Sign Up</Link>
          <span className="text-gray-700">|</span>
          <span className="text-xs bg-white/5 border border-white/10 px-2.5 py-0.5 rounded text-gray-600 font-mono">v2.0.0</span>
        </div>
      </footer>
    </div>
  );
}
