'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, AlertTriangle, ShieldCheck, Clock,
  TrendingUp, BarChart3, ArrowRight, Loader2, Play, Sparkles, UploadCloud, MessageSquare, GitCompare
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Counsel');

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
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs uppercase tracking-widest font-bold">Decrypting intelligence metrics...</span>
      </div>
    );
  }

  const {
    metrics = { totalContracts: 0, pendingReviews: 0, approvedContracts: 0, avgRiskScore: 0, averageReviewTimeHours: 0 },
    charts = { riskDistribution: [], contractTypes: [], monthlyUploads: [] },
    activities = []
  } = data || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Dashboard Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-blue-950/20 via-indigo-950/10 to-transparent p-8">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold uppercase tracking-widest text-blue-400">
            <Sparkles className="w-3 h-3" /> System Operational
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
            Good Morning, {userName}
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed font-light">
            Your review queue is up-to-date. The AI model parsed <span className="text-white font-medium">{metrics.totalContracts} agreements</span> with an average liability exposure index of <span className={`font-semibold ${metrics.avgRiskScore > 40 ? 'text-red-400' : 'text-blue-400'}`}>{metrics.avgRiskScore}%</span>.
          </p>
        </div>
      </div>

      {/* 2. Asymmetric Grid Layout - KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Contracts Card (Elevated) */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[140px] border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/10 flex items-center justify-center text-blue-400">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase">Active Vault</span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Contracts</span>
            <span className="text-3xl font-bold text-white font-display block">{metrics.totalContracts}</span>
          </div>
        </div>

        {/* Avg Risk Score Card */}
        <div className={`glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[140px] border-l-4 ${
          metrics.avgRiskScore > 40 ? 'border-l-red-500' : 'border-l-yellow-500'
        }`}>
          <div className="flex justify-between items-start">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
              metrics.avgRiskScore > 40 
                ? 'bg-red-600/10 border-red-500/10 text-red-400' 
                : 'bg-yellow-600/10 border-yellow-500/10 text-yellow-400'
            }`}>
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase">Risk Profile</span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Avg Risk Score</span>
            <span className="text-3xl font-bold text-white font-display block">{metrics.avgRiskScore}%</span>
          </div>
        </div>

        {/* Pending Review Card */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[140px] border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div className="h-9 w-9 rounded-xl bg-purple-600/10 border border-purple-500/10 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase">Audit Queue</span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Pending Review</span>
            <span className="text-3xl font-bold text-white font-display block">{metrics.pendingReviews}</span>
          </div>
        </div>

        {/* Avg Review Time Card */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[140px] border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div className="h-9 w-9 rounded-xl bg-emerald-600/10 border border-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase">Velocity SLA</span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Avg Review Time</span>
            <span className="text-3xl font-bold text-white font-display block">{metrics.averageReviewTimeHours}h</span>
          </div>
        </div>
      </div>

      {/* 3. Redesigned Visual Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload trend chart (Double column width) */}
        <div className="glass-card rounded-2xl p-6 md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Contract Upload Volume
            </h3>
            <span className="text-[10px] font-semibold text-gray-500 tracking-wider">6-Month Ingestion Trend</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyUploads} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(13, 17, 28, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', backdropFilter: 'blur(12px)' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Profile pie chart */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Risk Severity Profile
            </h3>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {charts.riskDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'rgba(13, 17, 28, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', backdropFilter: 'blur(12px)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#9ca3af', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Activities Timeline and Quick Access Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Timeline Log */}
        <div className="glass-card rounded-2xl p-6 md:col-span-2 space-y-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">Recent Activity Timeline</h3>
          <div className="relative pl-6 space-y-6 max-h-[350px] overflow-y-auto pr-2">
            {/* Timeline Vertical Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-blue-500 via-indigo-500/40 to-transparent" />

            {activities.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">No recorded activity logs found.</p>
            ) : (
              activities.map((act: any) => (
                <div key={act.id} className="relative flex gap-4 items-start text-xs">
                  {/* Timeline node */}
                  <div className="absolute left-[-20px] h-3.5 w-3.5 rounded-full border border-blue-500 bg-[#030712] flex items-center justify-center mt-1 z-10">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-bold text-white block">{act.action}</span>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">{act.details}</p>
                    <div className="flex gap-2 text-[10px] text-gray-500 font-mono">
                      <span>{act.user}</span>
                      <span>•</span>
                      <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Launch Panel */}
        <div className="glass-panel border-blue-500/10 rounded-2xl p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">OS Quick Launch</div>
            <h3 className="text-2xl font-bold text-white font-display mb-4">Execute AI Auditing</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6 font-light">
              Accelerate contract review cycles. Upload raw agreements, identify compliance deviations, compare versions, or prompt document RAG systems.
            </p>
          </div>
          <div className="space-y-2">
            <Link href="/dashboard/contracts" className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-300">
              <span className="flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Upload & Parse Contract</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/chat" className="py-2.5 px-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 border border-white/5 transition-all">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Chat RAG
              </Link>
              <Link href="/dashboard/compare" className="py-2.5 px-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 border border-white/5 transition-all">
                <GitCompare className="w-3.5 h-3.5 text-indigo-400" /> Compare
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
