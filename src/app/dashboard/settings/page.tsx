'use client';

import { useState, useEffect } from 'react';
import {
  Settings, Key, ShieldCheck, Terminal, Loader2, Plus,
  Trash2, Mail, Copy, Check, Info, Server, CreditCard
} from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Key creation state
  const [newKeyName, setNewKeyName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [generatedKeyVal, setGeneratedKeyVal] = useState<string | null>(null);

  const fetchSettingsData = () => {
    setLoading(true);
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        return fetch('/api/analytics');
      })
      .then(res => res.json())
      .then(analyticsData => {
        setAuditLogs(analyticsData.activities || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch settings failed:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleGenerateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setGenerating(true);
    const mockKey = `lqa_live_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;

    try {
      const newKey = {
        id: Math.random().toString(),
        name: newKeyName.trim(),
        key: mockKey,
        createdAt: new Date(),
      };
      setApiKeys(prev => [...prev, newKey]);
      setGeneratedKeyVal(mockKey);
      setNewKeyName('');
    } catch (error) {
      alert('Error generating API key');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    if (generatedKeyVal) setGeneratedKeyVal(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500 space-y-4">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-xs uppercase tracking-widest font-bold">Configuring workspace console...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Ambient Radial Blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Banner */}
      <div className="spatial-card rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <h1 className="font-display text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          System Settings <Settings className="w-5 h-5 text-blue-400 animate-spin-slow" />
        </h1>
        <p className="text-sm text-gray-300 font-light mt-1">Configure workspace parameters, generate developer API tokens, and inspect audit logs.</p>
      </div>

      {/* Grid Settings Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Columns */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* API Keys Panel */}
          <div className="spatial-card rounded-2xl p-6 space-y-6 relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-[0.15em] flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                Developer API Integration
              </h3>
              <span className="text-[8px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full uppercase font-extrabold tracking-wider">REST API</span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-light">
              Integrate contract auditing workflows into custom CRM, file managers, or local document flow pipelines using JWT-secured developer tokens.
            </p>

            {/* Key Generator Form */}
            <form onSubmit={handleGenerateApiKey} className="flex gap-4">
              <input
                type="text"
                required
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production CRM Server Key"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-blue-500/40 transition-all font-medium"
              />
              <button
                type="submit"
                disabled={generating}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Generate Token
              </button>
            </form>


            {/* Display newly generated key alert */}
            {generatedKeyVal && (
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/10 text-xs space-y-2">
                <div className="flex justify-between items-center text-blue-400 font-bold">
                  <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5" /> API Token Generated</span>
                  <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Copy Now - Hidden on refresh</span>
                </div>
                <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg font-mono text-gray-300">
                  <span className="truncate pr-4 select-all">{generatedKeyVal}</span>
                  <button
                    onClick={() => handleCopyKey(generatedKeyVal)}
                    className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer transition-colors"
                  >
                    {copiedKey === generatedKeyVal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Keys list */}
            <div className="space-y-2">
              {apiKeys.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center py-4 font-light">No developer API keys active.</p>
              ) : (
                apiKeys.map((k) => (
                  <div key={k.id} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs">
                    <div>
                      <span className="font-bold text-white block">{k.name}</span>
                      <span className="text-[9px] text-gray-500 font-mono mt-0.5 block">
                        Created: {new Date(k.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteKey(k.id)}
                      className="p-1.5 hover:bg-red-950/20 text-gray-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="Revoke Token"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Audit Logs Console */}
          <div className="spatial-card rounded-2xl p-6 space-y-4 shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-[0.15em] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              Secured Workspace Audit Console
            </h3>

            <div className="bg-black/90 rounded-xl p-4 font-mono text-[10px] leading-relaxed text-gray-400 max-h-[300px] overflow-y-auto space-y-2 border border-white/10 shadow-inner">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-600">console: No recorded audit events.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="flex gap-2">
                    <span className="text-indigo-400 shrink-0 font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className="text-blue-400 shrink-0 font-bold">{log.action}:</span>
                    <span className="text-gray-300">{log.details}</span>
                    <span className="text-gray-400 ml-auto font-bold font-display uppercase text-[8px] bg-white/10 px-2 py-0.5 rounded border border-white/10">
                      {log.user}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          {user && (
            <div className="spatial-card rounded-2xl p-6 space-y-4 shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-[0.15em] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Profile Identity
              </h3>

              <div className="flex items-center gap-3 bg-white/[0.03] p-3.5 rounded-xl border border-white/10">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-extrabold font-display text-base shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white leading-tight font-display">{user.name}</h4>
                  <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5 mt-1 font-medium"><Mail className="w-3.5 h-3.5 text-blue-400" /> {user.email}</span>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-4 text-[9px] text-gray-400 font-mono space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Authorization Role:</span>
                  <span className="text-white font-extrabold">{user.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Organization:</span>
                  <span className="text-white truncate font-extrabold">{user.organization?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Subscription Tier:</span>
                  <span className="text-emerald-300 font-extrabold uppercase tracking-wider text-[8px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">Enterprise OS</span>
                </div>
              </div>
            </div>
          )}

          {/* Billing Summary */}
          <div className="spatial-card rounded-2xl p-6 space-y-4 shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-[0.15em] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-yellow-400" />
              Tenant Usage Limits
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                  <span className="font-bold">Seat Occupancy (Users)</span>
                  <span className="text-white font-extrabold">Active: Unlimited</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-blue-500 w-[12%] rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                  <span className="font-bold">Contract Storage Capacity</span>
                  <span className="text-white font-extrabold">Limit: 5 GB</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-indigo-500 w-[2%] rounded-full animate-pulse shadow-[0_0_10px_#6366f1]" />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
