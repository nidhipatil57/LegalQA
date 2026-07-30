'use client';

import { useState, useEffect } from 'react';
import {
  GitCompare, ArrowRight, Loader2, AlertTriangle, ShieldCheck,
  Zap, HelpCircle, ArrowUpRight, CheckCircle2, ChevronRight, Sparkles, AlertCircle
} from 'lucide-react';

export default function ComparePage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  
  const [comparison, setComparison] = useState<any>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    fetch('/api/contracts')
      .then((res) => res.json())
      .then((data) => {
        const list = data.contracts || [];
        const analyzed = list.filter((c: any) => c.status !== 'PENDING_REVIEW');
        setContracts(analyzed);
        setLoadingList(false);

        if (analyzed.length > 1) {
          setSourceId(analyzed[0].id);
          setTargetId(analyzed[1].id);
        } else if (analyzed.length > 0) {
          setSourceId(analyzed[0].id);
        }
      })
      .catch((err) => {
        console.error('Fetch analyzed contracts error:', err);
        setLoadingList(false);
      });
  }, []);

  const handleCompare = async () => {
    if (!sourceId || !targetId) {
      alert('Please select two contracts to compare');
      return;
    }
    if (sourceId === targetId) {
      alert('Please select two different contracts to compare');
      return;
    }

    setComparing(true);
    setComparison(null);

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceContractId: sourceId, targetContractId: targetId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Comparison failed');

      setComparison(data.comparison);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error executing comparison');
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Clause Comparison Engine</h1>
        <p className="text-sm text-gray-400">Perform side-by-side audits, mapping difference vectors and risk directions.</p>
      </div>

      {loadingList ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500 space-y-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Accessing active audits...</span>
        </div>
      ) : contracts.length < 2 ? (
        <div className="glass-panel border-white/5 rounded-2xl p-12 text-center text-gray-500 space-y-4 max-w-lg mx-auto">
          <GitCompare className="w-12 h-12 text-blue-500 mx-auto" />
          <h3 className="text-lg font-bold text-white font-display">Multiple Audits Required</h3>
          <p className="text-xs leading-relaxed max-w-sm mx-auto font-light">
            You need to upload and analyze at least two different agreements to compare them side-by-side. Currently, you have {contracts.length} analyzed documents.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Source */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block px-1">Contract A (Reference Source)</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full px-3 py-3 text-xs font-semibold rounded-xl bg-white/[0.03] border border-white/10 text-white outline-none cursor-pointer hover:border-white/20 transition-colors"
              >
                {contracts.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#090d16]">
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Icon */}
            <div className="md:col-span-1 flex justify-center pt-4">
              <div className="h-10 w-10 rounded-full bg-white/[0.01] border border-white/5 flex items-center justify-center text-gray-500">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Target */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block px-1">Contract B (Proposed Target)</label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3 py-3 text-xs font-semibold rounded-xl bg-white/[0.03] border border-white/10 text-white outline-none cursor-pointer hover:border-white/20 transition-colors"
              >
                {contracts.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#090d16]">
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trigger button */}
          <button
            onClick={handleCompare}
            disabled={comparing}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-300 cursor-pointer hover:scale-[1.01]"
          >
            {comparing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Comparing Clauses...
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4" />
                Run Side-by-Side Clause Diff
              </>
            )}
          </button>

          {/* Skeletons while comparing */}
          {comparing && (
            <div className="space-y-4 animate-pulse pt-4">
              <div className="h-20 bg-white/5 rounded-xl" />
              <div className="h-48 bg-white/5 rounded-xl" />
            </div>
          )}

          {/* Results display */}
          {comparison && !comparing && (
            <div className="space-y-8">
              
              {/* Overall diff summary */}
              <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 border-l-2 border-l-blue-500 space-y-2">
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Comparative Summary</span>
                <p className="text-xs text-gray-300 leading-relaxed font-light">{comparison.summary}</p>
              </div>

              {/* Clause details list */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Clause Diff Breakdown</h3>
                
                <div className="space-y-4">
                  {comparison.comparisons.map((c: any, idx: number) => (
                    <div key={idx} className="glass-card rounded-2xl border-white/5 p-6 flex flex-col space-y-4 relative overflow-hidden">
                      
                      {/* Left border based on risk direction */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${
                        c.riskDirection === 'INCREASE' 
                          ? 'bg-red-500' 
                          : c.riskDirection === 'DECREASE' 
                            ? 'bg-emerald-500' 
                            : 'bg-gray-500'
                      }`} />

                      {/* Header containing category & status direction */}
                      <div className="flex justify-between items-center pl-2">
                        <span className="text-xs font-bold text-white uppercase tracking-widest font-display">{c.category} Clause</span>
                        <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          c.riskDirection === 'INCREASE'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : c.riskDirection === 'DECREASE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-white/5 text-gray-400 border border-white/5'
                        }`}>
                          Risk {c.riskDirection === 'INCREASE' ? 'Increased' : c.riskDirection === 'DECREASE' ? 'Decreased' : 'Neutral'}
                        </span>
                      </div>

                      {/* Side by side comparisons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2">
                        
                        {/* Reference Clause */}
                        <div className="space-y-2">
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Reference (Contract A)</span>
                          <p className="text-xs text-gray-400 leading-relaxed bg-[#090d16]/40 p-3.5 rounded-xl border border-white/5 font-mono select-text whitespace-pre-wrap">
                            "{c.contractAText}"
                          </p>
                        </div>

                        {/* Proposed Clause */}
                        <div className="space-y-2">
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Proposed (Contract B)</span>
                          <p className="text-xs text-gray-400 leading-relaxed bg-[#090d16]/40 p-3.5 rounded-xl border border-white/5 font-mono select-text whitespace-pre-wrap">
                            "{c.contractBText}"
                          </p>
                        </div>
                      </div>

                      {/* Diff Explanation */}
                      <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-xs text-gray-400 leading-relaxed pl-4 ml-2 flex gap-2.5 items-start">
                        <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Difference Analysis</span>
                          <span className="font-light leading-relaxed">{c.difference}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
