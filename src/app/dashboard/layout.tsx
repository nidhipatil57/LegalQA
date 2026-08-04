'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, MessageSquare, AlertTriangle, GitCompare,
  BookOpen, BarChart3, Users, CheckSquare, Settings, Search, Bell,
  Plus, LogOut, Command, ShieldCheck, User, X, ChevronDown, Sparkles, Network, FileBox
} from 'lucide-react';
import GlobalLegalCopilot from '@/components/ai/GlobalLegalCopilot';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    contracts: any[];
    tasks: any[];
  }>({ contracts: [], tasks: [] });

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Fetch profile
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        // Simulate a system notification based on pending reviews
        if (data.user?.organization) {
          setNotifications([
            { id: 1, text: "AI Analysis complete for Shuttle Contract", time: "5m ago" },
            { id: 2, text: `${data.user.role} workspace initialized successfully`, time: "10m ago" }
          ]);
        }
      })
      .catch(() => {});

    // Listen for Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Run Search when Query changes
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults({ contracts: [], tasks: [] });
      return;
    }

    const delayDebounce = setTimeout(() => {
      // Search Contracts
      fetch('/api/contracts')
        .then(res => res.json())
        .then(data => {
          const list = data.contracts || [];
          const filtered = list.filter((c: any) => 
            c.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(prev => ({ ...prev, contracts: filtered }));
        });

      // Search Tasks
      fetch('/api/tasks')
        .then(res => res.json())
        .then(data => {
          const list = data.tasks || [];
          const filtered = list.filter((t: any) => 
            t.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(prev => ({ ...prev, tasks: filtered }));
        });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navSections = [
    {
      title: 'MAIN',
      items: [
        { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Contracts', icon: FileText, path: '/dashboard/contracts', badge: 'Vault' },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { name: 'AI Assistant', icon: MessageSquare, path: '/dashboard/chat', badge: 'RAG' },
        { name: 'Risk Center', icon: AlertTriangle, path: '/dashboard/risks' },
        { name: 'Clause Compare', icon: GitCompare, path: '/dashboard/compare' },
        { name: 'Knowledge Base', icon: BookOpen, path: '/dashboard/knowledge' },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
        { name: 'Tasks', icon: CheckSquare, path: '/dashboard/tasks' },
        { name: 'Teams', icon: Users, path: '/dashboard/teams' },
        { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
      ]
    }
  ];

  return (
    <div className="relative text-gray-100 flex font-sans p-4 gap-4 overflow-hidden h-screen bg-[#030712]">
    <div className="relative min-h-screen text-gray-100 flex font-sans p-2.5 gap-3 overflow-hidden h-screen bg-[#030712]">
      {/* Background layer */}
      <div className="os-background" />

      {/* Ambient background glow points */}
      <div className="absolute top-0 left-1/4 w-[40vw] h-[40vw] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[35vw] h-[35vw] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* Sidebar Panel (Floating glass box) */}
      <aside className="w-[260px] glass-panel rounded-2xl flex flex-col justify-between shrink-0 p-3.5 select-none relative z-20 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

        <div>
          {/* Logo / Org Selector */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-3 border-b border-white/[0.08] mb-5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <span className="font-display font-extrabold text-lg text-white">L</span>
            </div>
            <div>
              <span className="font-display font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                Legal<span className="text-blue-400">QA</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              </span>
              <span className="block text-[8px] uppercase tracking-[0.2em] text-blue-300/80 -mt-0.5 font-bold">Spatial OS v2.4</span>
            </div>
          </Link>

          {/* Navigation links grouped into logical sections */}
          <div className="space-y-4">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="text-[9px] font-bold tracking-[0.2em] text-gray-500 px-3 uppercase mb-1">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-transparent text-white border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] font-bold'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                        )}
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`} />
                        <span className="whitespace-nowrap">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border shrink-0 whitespace-nowrap ml-2 ${
                          isActive
                            ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                            : 'bg-white/5 text-gray-400 border-white/5'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Profile Card / Sign Out */}
        {user && (
          <div className="border-t border-white/[0.08] pt-4">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 border border-blue-500/30 flex items-center justify-center text-blue-300 shadow-sm shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{user.name}</div>
                  <div className="text-[9px] uppercase tracking-widest font-extrabold text-blue-400 truncate flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shadow-[0_0_6px_#10b981]" />
                    {user.role}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Screen Area (Floating glass container) */}
      <div className="flex-1 flex flex-col min-w-0 glass-panel rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {/* Top Header */}
        <header className="h-16 border-b border-white/[0.08] flex items-center justify-between px-8 select-none shrink-0 bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Workspace:</span>
              {user ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-white hover:bg-white/[0.07] transition-all cursor-pointer">
                  <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                  {user.organization?.name}
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
              ) : (
                <div className="h-6 w-24 bg-white/5 rounded-lg animate-pulse" />
              )}
            </div>

            {/* System Operational & Vector RAG Status Badge */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-extrabold uppercase tracking-wider text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_6px_#3b82f6]" />
              System Operational & Vector RAG Active
            </div>          </div>

          <div className="flex items-center gap-3">
            {/* Quick Action Button */}
            <Link
              href="/dashboard/contracts"
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5" />
              New Audit
            </Link>

            {/* Search command bar */}
            <div
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-6 px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-blue-500/40 hover:bg-white/[0.06] text-xs text-gray-400 cursor-pointer select-none transition-all"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                Search workspace...
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[9px] font-mono text-gray-300">Ctrl+K</kbd>
            </div>

            {/* Notification center */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-panel border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-white">Notifications</h4>
                    <span className="text-[10px] text-blue-400 font-semibold cursor-pointer" onClick={() => setNotifications([])}>Clear all</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4">No new notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-gray-300 flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <div>{n.text}</div>
                            <span className="text-[10px] text-gray-500 font-mono block mt-1">{n.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-6 relative flex flex-col">
          <div className="w-full flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 relative">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {children}
          </div>
        </main>
        <GlobalLegalCopilot />
      </div>

      {/* COMMAND PALETTE MODAL (Frosted glass overlay) */}
      {cmdOpen && (
        <div className="fixed inset-0 bg-[#030712]/70 backdrop-blur-md flex items-start justify-center pt-24 z-[100] px-4">
          <div className="w-full max-w-xl glass-panel border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Input bar */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 bg-white/[0.01]">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type to search contracts or tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder-gray-500"
              />
              <button
                onClick={() => setCmdOpen(false)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="p-4 max-h-[350px] overflow-y-auto space-y-4">
              {searchQuery.trim().length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs space-y-1">
                  <Command className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p className="font-semibold text-white">Workspace Search</p>
                  <p className="text-[10px] text-gray-600">Search legal files, review checklists, and audits.</p>
                </div>
              ) : (
                <>
                  {searchResults.contracts.length === 0 && searchResults.tasks.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-xs">
                      No matching records found for "{searchQuery}".
                    </div>
                  ) : (
                    <>
                      {/* Contracts list */}
                      {searchResults.contracts.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2 px-2">Contracts</div>
                          <div className="space-y-1">
                            {searchResults.contracts.map((c) => (
                              <div
                                key={c.id}
                                onClick={() => {
                                  setCmdOpen(false);
                                  router.push(`/dashboard/contracts?id=${c.id}`);
                                }}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer text-xs transition"
                              >
                                <span className="font-medium text-white">{c.title}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/5 uppercase text-gray-400">
                                  {c.fileType}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tasks list */}
                      {searchResults.tasks.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2 px-2">Checklist Tasks</div>
                          <div className="space-y-1">
                            {searchResults.tasks.map((t) => (
                              <div
                                key={t.id}
                                onClick={() => {
                                  setCmdOpen(false);
                                  router.push('/dashboard/tasks');
                                }}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer text-xs transition"
                              >
                                <span className="font-medium text-white">{t.title}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-500/20 text-indigo-300">
                                  {t.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
