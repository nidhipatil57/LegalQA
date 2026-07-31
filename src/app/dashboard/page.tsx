'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, AlertTriangle, ShieldCheck, Clock,
  TrendingUp, BarChart3, ArrowRight, Loader2, Play, Sparkles, UploadCloud, MessageSquare, GitCompare,
  Activity, CheckCircle2, ArrowUpRight, Lock, FileCheck, Layers, BookOpen
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Counsel');
  const [timeframe, setTimeframe] = useState<'6m' | '30d' | '7d'>('6m');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    // Fetch analytics data
    fetch('/api/analytics')
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/login';
          }
          throw new Error('Unauthorized or failed to load analytics');
        }
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard metrics:', err);
        setLoading(false);
      });

    // Fetch user profile name
    fetch('/api/auth/me')
      .then(res => res.ok && res.json())
      .then(uData => {
        if (uData?.user?.name) {
          setUserName(uData.user.name.split(' ')[0]);
        }
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
          <Sparkles className="w-5 h-5 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs uppercase tracking-[0.2em] font-extrabold text-blue-400">Decrypting Spatial Intelligence Metrics...</span>
      </div>
    );
  }

  const {
    metrics = { totalContracts: 0, pendingReviews: 0, approvedContracts: 0, avgRiskScore: 0, averageReviewTimeHours: 0 },
    charts = { riskDistribution: [], contractTypes: [], monthlyUploads: [] },
    activities = []
  } = data || {};

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <Lock className="w-3.5 h-3.5 text-blue-400" />;
      case 'UPLOAD_CONTRACT':
        return <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ANALYZE_CONTRACT':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case 'DELETE_CONTRACT':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-4">
      {/* 1. Spatial Hero Greeting Banner */}
      <div className="spatial-card rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
        {/* Top Light Rim Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

        {/* Ambient Orb Backdrops */}
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Workspace Intelligence Synchronized
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300">{userName}</span>
            </h1>

            <p className="text-sm text-gray-300 leading-relaxed font-light">
              Your organization vault is active. AI parsed <span className="text-white font-semibold underline decoration-blue-500/50 underline-offset-4">{metrics.totalContracts} agreement{metrics.totalContracts === 1 ? '' : 's'}</span> with an average liability exposure index of <span className={`font-bold px-2 py-0.5 rounded-md border text-xs ${metrics.avgRiskScore > 40 ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'}`}>{metrics.avgRiskScore}%</span>.
            </p>
          </div>

          {/* Right Status Card */}
          <div className="w-full lg:w-auto shrink-0 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex flex-col gap-3 min-w-[260px] shadow-md">
            <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/[0.06] pb-2.5">
              <span className="font-extrabold text-gray-400 uppercase tracking-[0.15em] text-[9px]">Security & Telemetry</span>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Encrypted</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 font-light">Parsed Agreements</span>
                <span className="font-bold text-white">{metrics.totalContracts} Docs</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 font-light">Tenant Isolation</span>
                <span className="font-bold text-blue-400">Single-Tenant</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 font-light">Compliance Standard</span>
                <span className="font-bold text-gray-200">SOC2 Type II</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Elevated Spatial KPI Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {/* Total Contracts Card */}
        <div className="spatial-card rounded-2xl p-6 flex flex-col justify-between min-h-[155px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-extrabold text-blue-300 tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              Active Vault
            </span>
          </div>
          <div className="mt-4 space-y-1 relative z-10">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Contracts</span>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-extrabold text-white font-display tracking-tight">{metrics.totalContracts}</span>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +25%
              </span>
            </div>
          </div>
        </div>

        {/* Avg Risk Score Card */}
        <div className="spatial-card rounded-2xl p-6 flex flex-col justify-between min-h-[155px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-xl pointer-events-none transition-all duration-500 ${
            metrics.avgRiskScore > 40 ? 'bg-red-500/10 group-hover:bg-red-500/20' : 'bg-emerald-500/10 group-hover:bg-emerald-500/20'
          }`} />
          <div className="flex justify-between items-start relative z-10">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shadow-md ${
              metrics.avgRiskScore > 40 
                ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className={`text-[9px] font-extrabold tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border ${
              metrics.avgRiskScore > 40
                ? 'bg-red-500/10 text-red-300 border-red-500/20'
                : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'
            }`}>
              Risk Index
            </span>
          </div>
          <div className="mt-4 space-y-1 relative z-10">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Avg Exposure</span>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-extrabold text-white font-display tracking-tight">{metrics.avgRiskScore}%</span>
              <span className="text-[11px] font-bold text-amber-400">Moderate</span>
            </div>
          </div>
        </div>

        {/* Pending Review Card */}
        <div className="spatial-card rounded-2xl p-6 flex flex-col justify-between min-h-[155px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-extrabold text-purple-300 tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              Audit Queue
            </span>
          </div>
          <div className="mt-4 space-y-1 relative z-10">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pending Review</span>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-extrabold text-white font-display tracking-tight">{metrics.pendingReviews}</span>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Queue Clear
              </span>
            </div>
          </div>
        </div>

        {/* Avg Review Time Card */}
        <div className="spatial-card rounded-2xl p-6 flex flex-col justify-between min-h-[155px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-extrabold text-emerald-300 tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Velocity SLA
            </span>
          </div>
          <div className="mt-4 space-y-1 relative z-10">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Avg Review Time</span>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-extrabold text-white font-display tracking-tight">{metrics.averageReviewTimeHours}h</span>
              <span className="text-[11px] font-bold text-emerald-400">⚡ 3.5x Faster</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. High-Definition Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload trend chart (Double column width) */}
        <div className="spatial-card rounded-2xl p-6 lg:col-span-2 space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div>
              <h3 className="text-xs font-extrabold text-white uppercase tracking-[0.15em] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Contract Ingestion Velocity
              </h3>
              <p className="text-[11px] text-gray-400 font-light mt-0.5">Ingestion volume trend across legal departments</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] text-[10px] font-bold text-gray-400">
                <button
                  onClick={() => setTimeframe('6m')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${timeframe === '6m' ? 'bg-blue-600 text-white shadow-sm font-extrabold' : 'hover:text-white'}`}
                >
                  6 Months
                </button>
                <button
                  onClick={() => setTimeframe('30d')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${timeframe === '30d' ? 'bg-blue-600 text-white shadow-sm font-extrabold' : 'hover:text-white'}`}
                >
                  30 Days
                </button>
              </div>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyUploads} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(13, 17, 28, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Profile pie chart */}
        <div className="spatial-card rounded-2xl p-6 space-y-6 flex flex-col justify-between relative overflow-hidden">
          <div className="border-b border-white/[0.06] pb-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-[0.15em] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Risk Severity Breakdown
            </h3>
            <p className="text-[11px] text-gray-400 font-light mt-0.5">Automated clause liability distribution</p>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center">
            {/* Centered Donut Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <span className="text-2xl font-extrabold text-white font-display">{metrics.avgRiskScore}%</span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Avg Risk</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {charts.riskDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(13,17,28,0.8)" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'rgba(13, 17, 28, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(12px)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Custom Pills */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
            {charts.riskDistribution.map((item: any) => (
              <div key={item.name} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="text-[9px] uppercase tracking-wider font-bold block text-gray-400 truncate">{item.name}</span>
                <span className="text-xs font-bold text-white block mt-0.5" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Activities Timeline and Quick Access Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Log */}
        <div className="spatial-card rounded-2xl p-6 lg:col-span-2 space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-[0.15em] flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Recent Activity Timeline
            </h3>
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Audit Log Realtime</span>
          </div>

          <div className="relative pl-6 space-y-6 max-h-[350px] overflow-y-auto pr-2">
            {/* Timeline Vertical Gradient Line */}
            <div className="absolute left-[13px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-blue-500 via-indigo-500/40 to-transparent" />

            {activities.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10">No recorded activity logs found in system audit history.</p>
            ) : (
              activities.map((act: any) => (
                <div key={act.id} className="relative flex gap-4 items-start text-xs group">
                  {/* Timeline Node Icon Badge */}
                  <div className="absolute left-[-22px] h-6 w-6 rounded-full border border-white/10 bg-[#070d19] flex items-center justify-center shadow-lg z-10 group-hover:scale-110 transition-transform">
                    {getActivityIcon(act.action)}
                  </div>
                  <div className="space-y-1.5 pl-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white uppercase text-[11px] tracking-wide">{act.action}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 font-mono text-gray-400">
                        {act.user}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">{act.details}</p>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {new Date(act.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Launch Panel */}
        <div className="spatial-card rounded-2xl p-6 flex flex-col justify-between border-blue-500/20 shadow-[0_15px_40px_rgba(59,130,246,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-1.5 text-[9px] font-extrabold text-blue-300 uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
              <Sparkles className="w-3 h-3 text-blue-400" /> OS Quick Launch
            </div>
            <h3 className="text-2xl font-extrabold text-white font-display mb-3 tracking-tight">Execute AI Auditing</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-6 font-light">
              Accelerate contract review cycles. Upload raw agreements, identify compliance deviations, compare versions, or prompt document RAG systems.
            </p>
          </div>

          <div className="space-y-2.5 relative z-10">
            <Link
              href="/dashboard/contracts"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-between shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.45)] transition-all duration-300 hover:scale-[1.01]"
            >
              <span className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4" /> Upload & Parse Contract
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/chat"
                className="py-3 px-3 bg-white/[0.03] hover:bg-white/[0.08] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 border border-white/[0.08] transition-all hover:border-blue-500/30"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Chat RAG
              </Link>
              <Link
                href="/dashboard/compare"
                className="py-3 px-3 bg-white/[0.03] hover:bg-white/[0.08] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 border border-white/[0.08] transition-all hover:border-indigo-400/30"
              >
                <GitCompare className="w-3.5 h-3.5 text-indigo-400" /> Compare
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

