'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert, Loader2, ArrowRight, Eye, EyeOff, Lock, Mail, User, Building,
  Sparkles, ShieldCheck, Zap, FileText, CheckCircle2
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !organizationName || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, organizationName, password, role: 'ADMIN' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-gray-100 flex items-center justify-center bg-[#070d19] overflow-hidden font-sans">
      {/* Background layer */}
      <div className="os-background" />

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-blue-600/10 blur-[140px] pointer-events-none animate-aurora-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none animate-aurora-slower" />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* ──────────── LEFT SIDE: BRAND SHOWCASE PANEL ──────────── */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between h-full pr-8">
          <div>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-10 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <span className="font-display font-bold text-xl text-white">L</span>
              </div>
              <div>
                <span className="font-display font-extrabold text-2xl tracking-tight text-white">Legal<span className="text-blue-400">QA</span></span>
                <span className="block text-[9px] uppercase tracking-[0.2em] text-blue-300 font-semibold">Intelligence OS</span>
              </div>
            </Link>

            {/* Main Feature Headline */}
            <h1 className="font-display text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4">
              Deploy Your Private<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Legal Tenant Workspace
              </span>
            </h1>
            <p className="text-gray-400 text-sm font-light leading-relaxed mb-8 max-w-md">
              Deploy in seconds. Onboard your team, analyze contract liabilities, and automate legal workflows with spatial AI intelligence.
            </p>

            {/* Included in Tenant OS */}
            <div className="space-y-3.5 max-w-md">
              {[
                { title: 'Dedicated Tenant Isolation', desc: 'Private document store with vector embedding index.' },
                { title: 'Unlimited Clause Extraction', desc: 'AI liability risk scoring across all contract types.' },
                { title: 'RAG Semantic Chatbot', desc: 'Ask questions directly to your uploaded contract library.' },
                { title: 'Multi-User Team Management', desc: 'Role-based access control (Admin, Attorney, Viewer).' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-white">{item.title}</h3>
                    <p className="text-[11px] text-gray-400 font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Trust Note */}
          <div className="pt-8 flex items-center gap-3 text-xs text-gray-400 border-t border-white/[0.05]">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
            <span>Bank-grade 256-bit encryption. Zero training on customer data.</span>
          </div>
        </div>

        {/* ──────────── RIGHT SIDE: AUTH FORM CARD ──────────── */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-[#0e1626]/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(59,130,246,0.06)] relative overflow-hidden">

            {/* Top Light Rim Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

            {/* Mobile Header */}
            <div className="flex lg:hidden flex-col items-center mb-6">
              <Link href="/" className="flex items-center gap-2.5 mb-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="font-display font-bold text-lg text-white">L</span>
                </div>
                <span className="font-display font-bold text-xl text-white">Legal<span className="text-blue-400">QA</span></span>
              </Link>
            </div>

            <div className="text-center lg:text-left mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold uppercase tracking-wider text-blue-300 mb-3">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Deploy OS
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight mb-1.5">
                Create Organization
              </h2>
              <p className="text-xs text-gray-400 font-light">
                Initialize your firm's LegalQA workspace in seconds.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-3 animate-pulse">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Partner Name"
                    className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-blue-500/10 text-white text-xs rounded-xl pl-11 pr-4 py-3 outline-none transition-all duration-300 placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@firm.com"
                    className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-blue-500/10 text-white text-xs rounded-xl pl-11 pr-4 py-3 outline-none transition-all duration-300 placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Organization Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Organization / Firm Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="e.g. Apex Legal LLP"
                    className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-blue-500/10 text-white text-xs rounded-xl pl-11 pr-4 py-3 outline-none transition-all duration-300 placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Master Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-blue-500/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-blue-500/10 text-white text-xs rounded-xl pl-11 pr-11 py-3 outline-none transition-all duration-300 placeholder:text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.35)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Initializing Tenant OS...
                  </>
                ) : (
                  <>
                    Deploy OS Workspace
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-400 font-light pt-5 border-t border-white/[0.06]">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
