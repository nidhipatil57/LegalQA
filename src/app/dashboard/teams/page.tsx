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

      // Reset form
      setName('');
      setEmail('');
      setRole('ASSOCIATE');
      setPassword('');
      setInviteOpen(false);

      // Refresh members list
      fetchMembers();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error inviting member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">Teams & Members</h1>
          <p className="text-sm text-gray-400">Manage user authorization groups, tenant seats, and role permission settings.</p>
        </div>

        <button
          onClick={() => setInviteOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add Lawyer Member
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh] text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" /> Listing workspace members...
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 text-gray-500 space-y-2">
          <Users className="w-10 h-10 text-gray-700 mx-auto" />
          <h4 className="text-base font-bold text-white">No Team Members Found</h4>
          <p className="text-xs">Invite colleagues to collaborate on auditing NDAs and contracts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {members.map((member) => (
            <div key={member.id} className="glass-card rounded-2xl p-6 border-white/5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold font-display">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{member.name}</h3>
                    <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" /> {member.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5 text-[10px] text-gray-500 font-mono">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(member.createdAt).toLocaleDateString()}</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider">
                  {member.role}
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
            <p className="text-xs text-gray-500 mb-6">Register a new colleague into your organization's legal operating system.</p>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lawyer Name"
                  className="w-full glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lawyer@firm.com"
                  className="w-full glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Role Permissions</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white/[0.03] border border-white/10 text-white outline-none cursor-pointer"
                  >
                    <option value="PARTNER" className="bg-[#090d1a]">Partner</option>
                    <option value="SENIOR_LAWYER" className="bg-[#090d1a]">Senior Lawyer</option>
                    <option value="ASSOCIATE" className="bg-[#090d1a]">Associate</option>
                    <option value="PARALEGAL" className="bg-[#090d1a]">Paralegal</option>
                    <option value="COMPLIANCE_OFFICER" className="bg-[#090d1a]">Compliance Officer</option>
                    <option value="VIEWER" className="bg-[#090d1a]">Viewer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Temporal Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
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
