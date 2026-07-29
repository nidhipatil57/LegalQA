'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, AlertTriangle, ShieldCheck, Clock,
  TrendingUp, BarChart3, ArrowRight, Loader2, Play
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
        <span>Loading workspace analytics...</span>
      </div>
    );
  }

  const {
    metrics = { totalContracts: 0, pendingReviews: 0, approvedContracts: 0, avgRiskScore: 0, averageReviewTimeHours: 0 },
    charts = { riskDistribution: [], contractTypes: [], monthlyUploads: [] },
    activities = []
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Workspace Overview</h1>
        <p className="text-sm text-gray-400">Real-time statistics, legal risk alerts, and audit timelines.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/10 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Active</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 block uppercase">Total Contracts</span>
            <span className="text-3xl font-bold text-white font-display block">{metrics.totalContracts}</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
              metrics.avgRiskScore > 40 
                ? 'bg-red-600/10 border-red-500/10 text-red-400' 
                : 'bg-yellow-600/10 border-yellow-500/10 text-yellow-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Risk Alert</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 block uppercase">Avg Risk Score</span>
            <span className="text-3xl font-bold text-white font-display block">{metrics.avgRiskScore}%</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-purple-600/10 border border-purple-500/10 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Queue</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 block uppercase">Pending Review</span>
            <span className="text-3xl font-bold text-white font-display block">{metrics.pendingReviews}</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-green-600/10 border border-green-500/10 flex items-center justify-center text-green-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">SLA</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 block uppercase">Avg Review Time</span>
            <span className="text-3xl font-bold text-white font-display block">{metrics.averageReviewTimeHours}h</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly uploads area chart */}
        <div className="glass-card rounded-2xl p-6 md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Contract Upload Volume
            </h3>
            <span className="text-xs text-gray-500">6-Month Trend</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyUploads} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ background: '#090d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk distribution pie chart */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
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
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.riskDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#090d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activities Feed and Next Step Quick Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Recent Audit Log Timeline */}
        <div className="glass-card rounded-2xl p-6 md:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity Timeline</h3>
          <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2">
            {activities.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">No recorded activity logs found.</p>
            ) : (
              activities.map((act: any) => (
                <div key={act.id} className="flex gap-4 items-start text-sm">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="space-y-1">
                    <span className="font-bold text-white block">{act.action}</span>
                    <p className="text-xs text-gray-400 leading-relaxed">{act.details}</p>
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

        {/* Right Column: Quick Onboarding Action */}
        <div className="glass-panel border-blue-500/10 rounded-2xl p-8 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Workspace Actions</div>
            <h3 className="text-2xl font-bold text-white font-display mb-4">Ready to audit?</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Upload a new corporate agreement or NDA to parse metadata, extract obligations, detect clauses, and scan risk severities.
            </p>
          </div>
          <Link href="/dashboard/contracts" className="py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center justify-between shadow-lg shadow-blue-500/25 transition-all duration-300">
            <span>Upload Document</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
