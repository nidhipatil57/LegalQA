'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3, Loader2, Sparkles, TrendingUp, Clock, ShieldCheck,
  Zap, Calendar, HelpCircle, ArrowUpRight, CheckCircle2, Download
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

export default function AnalyticsPage() {
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
        console.error('Fetch analytics failed:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs uppercase tracking-widest font-bold">Assembling analytics dashboard...</span>
      </div>
    );
  }

  const lawyerProductivity = [
    { name: 'Partner A', reviewed: 12, closedTasks: 18 },
    { name: 'Lawyer B', reviewed: 24, closedTasks: 35 },
    { name: 'Associate C', reviewed: 32, closedTasks: 42 },
    { name: 'Paralegal D', reviewed: 15, closedTasks: 28 },
  ];

  const reviewTimeImprovements = [
    { month: 'Jan', manualTime: 12, aiTime: 2.5 },
    { month: 'Feb', manualTime: 11, aiTime: 2.1 },
    { month: 'Mar', manualTime: 12.5, aiTime: 1.8 },
    { month: 'Apr', manualTime: 10.8, aiTime: 1.6 },
    { month: 'May', manualTime: 11.2, aiTime: 1.2 },
    { month: 'Jun', manualTime: 9.5, aiTime: 0.9 },
  ];

  const aiTokenBreakdown = [
    { name: 'RAG Auditing', value: 45, color: '#3b82f6' },
    { name: 'Message Streams', value: 30, color: '#6366f1' },
    { name: 'Semantic Search', value: 15, color: '#a855f7' },
    { name: 'Rewrite Checks', value: 10, color: '#f59e0b' },
  ];

  const metrics = data?.metrics || { totalContracts: 0, pendingReviews: 0, avgRiskScore: 0 };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Ambient Radial Blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Banner */}
      <div className="spatial-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Workspace Analytics <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </h1>
          <p className="text-sm text-gray-300 font-light mt-1">Evaluate lawyer throughput, cycle improvements, and RAG prompt performance metrics.</p>
        </div>

        <button
          onClick={() => alert('Generating PDF Analytics report...')}
          className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition cursor-pointer hover:scale-[1.02] shadow-sm"
        >
          <Download className="w-4 h-4 text-blue-400" /> Export Report (PDF)
        </button>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="spatial-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[9px] font-extrabold text-emerald-300 uppercase tracking-[0.15em] block mb-1">Time Saved Cumulative</span>
          <h3 className="text-4xl font-extrabold text-white font-display tracking-tight">185.4 Hours</h3>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-2">
            <Sparkles className="w-3.5 h-3.5" /> +15.2% Increase month-over-month
          </span>
        </div>

        <div className="spatial-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[9px] font-extrabold text-indigo-300 uppercase tracking-[0.15em] block mb-1">AI Prompt API Efficiency</span>
          <h3 className="text-4xl font-extrabold text-white font-display tracking-tight">97.8%</h3>
          <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-2 font-bold">
            Avg Latency: 1.1s (Groq Llama 3)
          </span>
        </div>

        <div className="spatial-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[9px] font-extrabold text-blue-300 uppercase tracking-[0.15em] block mb-1">Active Client Vault</span>
          <h3 className="text-4xl font-extrabold text-white font-display tracking-tight">{metrics.totalContracts} Contracts</h3>
          <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1 mt-2">
            SLA Response Compliance: 100%
          </span>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Chart 1: Productivity comparison */}
        <div className="spatial-card rounded-2xl p-6 space-y-6">
          <div className="border-b border-white/[0.06] pb-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-[0.15em] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Lawyer Throughput & Task Completion
            </h3>
            <p className="text-[11px] text-gray-400 font-light mt-0.5">Audited contracts vs completed tasks by role</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lawyerProductivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(13, 17, 28, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(12px)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="reviewed" name="Audited Contracts" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="closedTasks" name="Completed Tasks" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cycle Time Improvements Line */}
        <div className="spatial-card rounded-2xl p-6 space-y-6">
          <div className="border-b border-white/[0.06] pb-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-[0.15em] flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Average Cycle Duration (Manual vs AI)
            </h3>
            <p className="text-[11px] text-gray-400 font-light mt-0.5">Review hours benchmark reduction</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reviewTimeImprovements} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(13, 17, 28, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(12px)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="manualTime" name="Manual review time" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="aiTime" name="LegalQA OS assisted" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: AI Token Breakdown Pie */}
        <div className="spatial-card rounded-2xl p-6 space-y-6 xl:col-span-2 w-full">
          <div className="border-b border-white/[0.06] pb-4 text-center">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-[0.15em]">
              AI Operations Token Allocation
            </h3>
            <p className="text-[11px] text-gray-400 font-light mt-0.5">Distribution of LLM token consumption by feature</p>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aiTokenBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {aiTokenBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(13,17,28,0.8)" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(13, 17, 28, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(12px)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );

}
