'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="relative min-h-screen text-gray-100 flex items-center justify-center px-6 overflow-hidden">
      {/* Background Layer */}
      <div className="os-background" />

      {/* Decorative Orbs */}
      <div className="glow-orb-blue top-1/4 left-1/4 opacity-40" />
      <div className="glow-orb-indigo bottom-1/4 right-1/4 opacity-30" />

      <div className="w-full max-w-md relative z-10 my-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-display font-bold text-xl text-white">L</span>
          </div>
          <div className="text-left">
            <span className="font-display font-bold text-xl tracking-tight text-white">Legal<span className="text-blue-400">QA</span></span>
            <span className="block text-[8px] uppercase tracking-widest text-gray-400 -mt-1 font-semibold">Intelligence OS</span>
          </div>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white font-display mb-2 text-center">Deploy Workspace</h2>
          <p className="text-sm text-gray-400 mb-8 text-center font-light">Create your legal tenant operating system.</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/25 text-red-300 text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Full Name</label>
              <input
                type="text"
                required
                disabled={loading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Partner Name"
                className="w-full glass-input"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Email Address</label>
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@firm.com"
                className="w-full glass-input"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Organization / Firm</label>
              <input
                type="text"
                required
                disabled={loading}
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Apex Legal LLP"
                className="w-full glass-input"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Master Password</label>
              <input
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Tenant...
                </>
              ) : (
                <>
                  Deploy OS Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400 font-light">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 hover:underline font-semibold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
