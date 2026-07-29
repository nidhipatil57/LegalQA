'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, MessageSquare, AlertTriangle, GitCompare,
  BookOpen, BarChart3, Users, CheckSquare, Settings, Search, Bell,
  Plus, LogOut, Command, ShieldCheck, User, X
} from 'lucide-react';

interface Member {
  name: string;
  role: string;
}

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
      .then((data) => setUser(data.user))
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

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Contracts', icon: FileText, path: '/dashboard/contracts' },
    { name: 'AI Assistant', icon: MessageSquare, path: '/dashboard/chat' },
    { name: 'Risk Center', icon: AlertTriangle, path: '/dashboard/risks' },
    { name: 'Clause Compare', icon: GitCompare, path: '/dashboard/compare' },
    { name: 'Knowledge Base', icon: BookOpen, path: '/dashboard/knowledge' },
    { name: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
    { name: 'Tasks', icon: CheckSquare, path: '/dashboard/tasks' },
    { name: 'Teams', icon: Users, path: '/dashboard/teams' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex font-sans">
      {/* Sidebar Panel */}
      <aside className="w-64 glass-panel border-r border-white/5 flex flex-col justify-between shrink-0 p-4 select-none">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-white/5 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center">
              <span className="font-display font-bold text-base text-white">L</span>
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-white">Legal<span className="text-blue-400">QA</span></span>
              <span className="block text-[8px] uppercase tracking-wider text-gray-400 -mt-1 font-semibold">Intelligence OS</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Card */}
        {user && (
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <User className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{user.name}</div>
                  <div className="text-[9px] uppercase tracking-wider font-bold text-blue-400 truncate">{user.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Screen Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 select-none">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Workspace:</span>
            {user ? (
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white">
                {user.organization?.name}
              </span>
            ) : (
              <div className="h-6 w-24 bg-white/5 rounded-lg animate-pulse" />
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Search command bar */}
            <div
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-8 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] text-xs text-gray-500 cursor-pointer select-none transition-all"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                Search workspace...
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono">Ctrl+K</kbd>
            </div>

            {/* Notification center */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="h-9 w-9 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-panel border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
                  <h4 className="text-sm font-bold text-white mb-3">Workspace Notifications</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <p className="text-xs text-gray-500 text-center py-4">No new notifications</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>

      {/* COMMAND PALETTE MODAL */}
      {cmdOpen && (
        <div className="fixed inset-0 bg-[#030712]/80 backdrop-blur-sm flex items-start justify-center pt-24 z-[100] px-4">
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
                className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="p-4 max-h-[350px] overflow-y-auto space-y-4">
              {searchQuery.trim().length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs space-y-1">
                  <Command className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p>Search legal files, review checklists, and audits.</p>
                  <p className="text-[10px] text-gray-600">Start typing to fetch matching records...</p>
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
                          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-2 px-2">Contracts</div>
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
                          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2 px-2">Checklist Tasks</div>
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
