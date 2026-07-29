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
    // Fetch profile
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        
        // Fetch audit logs and API keys from settings helpers
        // We will fetch analytics which has audit logs, or settings-specific endpoints
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
      // Simulate/mock API key storage locally or in DB (represented in state)
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
      <div className="flex items-center justify-center min-h-[50vh] text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" /> Loading settings dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">System Settings</h1>
        <p className="text-sm text-gray-400">Configure workspace parameters, generate developer API tokens, and inspect audit logs.</p>
      </div>

      {/* Grid Settings Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Columns (span 2) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* API Keys Panel */}
          <div className="glass-card rounded-2xl p-6 border-white/5 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                Developer API Integration
              </h3>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">REST API</span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
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
                className="flex-1 glass-input text-xs"
              />
              <button
                type="submit"
                disabled={generating}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Generate Token
              </button>
            </form>

            {/* Display newly generated key alert */}
            {generatedKeyVal && (
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs space-y-2">
                <div className="flex justify-between items-center text-blue-400 font-bold">
                  <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5" /> API Token Generated</span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Copy Now - Hidden on refresh</span>
                </div>
                <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg font-mono text-gray-300">
                  <span className="truncate pr-4">{generatedKeyVal}</span>
                  <button
                    onClick={() => handleCopyKey(generatedKeyVal)}
                    className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer"
                  >
                    {copiedKey === generatedKeyVal ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Keys list */}
            <div className="space-y-2">
              {apiKeys.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center py-4">No developer API keys active.</p>
              ) : (
                apiKeys.map((k) => (
                  <div key={k.id} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs">
                    <div>
                      <span className="font-bold text-white block">{k.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                        Created: {new Date(k.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteKey(k.id)}
                      className="p-1.5 hover:bg-red-950/20 text-gray-500 hover:text-red-400 rounded-lg transition cursor-pointer"
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
          <div className="glass-card rounded-2xl p-6 border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              Secured Workspace Audit Console
            </h3>

            <div className="bg-black/80 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-gray-400 max-h-[300px] overflow-y-auto space-y-2 border border-white/5">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-600">console: No recorded audit events.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="flex gap-2">
                    <span className="text-indigo-500 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className="text-blue-400 shrink-0">{log.action}:</span>
                    <span className="text-gray-300">{log.details}</span>
                    <span className="text-gray-600 ml-auto font-bold font-display uppercase text-[9px] bg-white/5 px-1.5 py-0.5 rounded">
                      {log.user}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Column (Profile & Billing) */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          {user && (
            <div className="glass-card rounded-2xl p-6 border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Profile Identity
              </h3>

              <div className="flex items-center gap-3 bg-white/[0.01] p-3 rounded-xl border border-white/5">
                <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold font-display">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{user.name}</h4>
                  <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1 mt-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 text-[10px] text-gray-500 font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span>Authorization Role:</span>
                  <span className="text-white font-bold">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span>Organization:</span>
                  <span className="text-white truncate">{user.organization?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subscription Tier:</span>
                  <span className="text-emerald-400 font-bold">Enterprise OS ($500/mo)</span>
                </div>
              </div>
            </div>
          )}

          {/* Billing Summary */}
          <div className="glass-card rounded-2xl p-6 border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-yellow-500" />
              Tenant Usage Limits
            </h3>

            <div className="space-y-4 text-xs">
              {/* Limit 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                  <span>Seat Occupancy (Users)</span>
                  <span className="text-white font-bold">Active: Unlimited</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[12%] rounded-full" />
                </div>
              </div>

              {/* Limit 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                  <span>Contract Storage Capacity</span>
                  <span className="text-white font-bold">Limit: 5 GB</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[2%] rounded-full" />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
