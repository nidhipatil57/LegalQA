'use client';

import { useState, useEffect } from 'react';
import {
  Users, Plus, Loader2, ShieldCheck, Mail, Calendar, Key, UserPlus, X, Check
} from 'lucide-react';

export default function TeamsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Invite form state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ASSOCIATE');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMembers = () => {
    setLoading(true);
    fetch('/api/teams')
      .then((res) => res.json())
      .then((data) => {
        setMembers(data.members || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch members error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role || !password) return;

    setSaving(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add member');

      setName('');
      setEmail('');
      setRole('ASSOCIATE');
      setPassword('');
      setInviteOpen(false);

      fetchMembers();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error inviting member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Ambient Radial Blur */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Banner */}
      <div className="spatial-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Teams & Members <Users className="w-5 h-5 text-blue-400" />
          </h1>
          <p className="text-sm text-gray-300 font-light mt-1">Manage user authorization groups, tenant seats, and role permission settings across your firm.</p>
        </div>

        <button
          onClick={() => setInviteOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all cursor-pointer hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4" /> Add Lawyer Member
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500 space-y-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs uppercase tracking-widest font-bold text-blue-400">Querying firm hierarchy...</span>
        </div>
      ) : members.length === 0 ? (
        <div className="spatial-card rounded-2xl p-16 text-center text-gray-400 space-y-3 max-w-md mx-auto">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto shadow-md">
            <Users className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-extrabold text-white font-display">No Team Members Found</h4>
          <p className="text-xs text-gray-300 font-light">Invite colleagues to collaborate on auditing NDAs and contracts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {members.map((member) => (
            <div key={member.id} className="spatial-card rounded-2xl p-6 space-y-4 relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-extrabold font-display text-base shadow-md">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white leading-tight font-display">{member.name}</h3>
                    <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5 mt-1 font-medium">
                      <Mail className="w-3 h-3 text-blue-400" /> {member.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/[0.06] text-[9px] text-gray-400 font-mono">
                <span className="flex items-center gap-1.5 font-bold"><Calendar className="w-3.5 h-3.5 text-gray-500" /> {new Date(member.createdAt).toLocaleDateString()}</span>
                <span className="px-2.5 py-1 rounded-md text-[8px] bg-blue-500/10 text-blue-300 border border-blue-500/20 font-extrabold uppercase tracking-wider">
                  {member.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* ADD MEMBER MODAL */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-[#030712]/80 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="w-full max-w-md glass-panel border-white/10 rounded-2xl p-8 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white font-display mb-2">Add Workspace Member</h3>
            <p className="text-xs text-gray-500 mb-6 font-light">Register a new colleague into your organization's legal operating system.</p>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lawyer Name"
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lawyer@firm.com"
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Role Permissions</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl bg-white/[0.03] border border-white/10 text-white outline-none cursor-pointer hover:border-white/20 transition-colors"
                  >
                    <option value="PARTNER" className="bg-[#090d16]">Partner</option>
                    <option value="SENIOR_LAWYER" className="bg-[#090d16]">Senior Lawyer</option>
                    <option value="ASSOCIATE" className="bg-[#090d16]">Associate</option>
                    <option value="PARALEGAL" className="bg-[#090d16]">Paralegal</option>
                    <option value="COMPLIANCE_OFFICER" className="bg-[#090d16]">Compliance Officer</option>
                    <option value="VIEWER" className="bg-[#090d16]">Viewer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
