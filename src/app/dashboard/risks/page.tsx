'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle, Copy, Check, ChevronRight, ShieldAlert,
  ArrowRight, Sparkles, Filter, Library, Loader2, Info
} from 'lucide-react';
import { Suspense } from 'react';

function RisksContent() {
  const searchParams = useSearchParams();
  const paramContractId = searchParams.get('id');

  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [risks, setRisks] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingRisks, setLoadingRisks] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch analyzed contracts
  useEffect(() => {
    fetch('/api/contracts')
      .then((res) => res.json())
      .then((data) => {
        const list = data.contracts || [];
        const analyzed = list.filter((c: any) => c.status !== 'PENDING_REVIEW');
        setContracts(analyzed);
        setLoadingList(false);

        if (paramContractId) {
          setSelectedContractId(paramContractId);
        } else if (analyzed.length > 0) {
          setSelectedContractId(analyzed[0].id);
        }
      })
      .catch((err) => {
        console.error('Fetch analyzed contracts error:', err);
        setLoadingList(false);
      });
  }, [paramContractId]);

  // Fetch risks when contract changes
  useEffect(() => {
    if (!selectedContractId) return;

    setLoadingRisks(true);
    fetch(`/api/contracts/${selectedContractId}`)
      .then((res) => res.json())
      .then((data) => {
        setRisks(data.contract?.risks || []);
        setLoadingRisks(false);
      })
      .catch((err) => {
        console.error('Failed to load contract risks:', err);
        setLoadingRisks(false);
      });
  }, [selectedContractId]);

  const handleCopyRewrite = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">Risk Detection Center</h1>
          <p className="text-sm text-gray-400">Review AI-flagged liabilities, severity warnings, and rewrite recommendations.</p>
        </div>

        {/* Dropdown Selector */}
        {contracts.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><Filter className="w-3.5 h-3.5" /> Select Audit:</span>
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-white/[0.03] border border-white/10 text-white outline-none cursor-pointer hover:border-white/20 transition-colors"
            >
              {contracts.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#090d16] text-white">
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loadingList ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500 space-y-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Querying audit logs...</span>
        </div>
      ) : contracts.length === 0 ? (
        <div className="glass-panel border-white/5 rounded-2xl p-12 text-center text-gray-500 space-y-4 max-w-lg mx-auto">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
          <h3 className="text-lg font-bold text-white font-display">No Audited Contracts</h3>
          <p className="text-xs leading-relaxed max-w-sm mx-auto font-light">
            Before reviewing risks, you must upload a document and click "Run AI Analysis" inside the Contracts tab.
          </p>
        </div>
      ) : loadingRisks ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500 space-y-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Constructing telemetry matrix...</span>
        </div>
      ) : risks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-500 space-y-3">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-display">Zero Risks Detected</h3>
          <p className="text-xs text-gray-400 font-light">Congratulations. This contract complies with typical corporate standard terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {risks.map((risk) => (
            <div key={risk.id} className="glass-card rounded-2xl p-6 border-white/5 flex flex-col space-y-6 relative overflow-hidden">
              {/* Highlight ribbon based on severity */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                risk.severity === 'HIGH' 
                  ? 'bg-red-500' 
                  : risk.severity === 'MEDIUM' 
                    ? 'bg-yellow-500' 
                    : 'bg-emerald-500'
              }`} />

              {/* Title & Severity */}
              <div className="flex justify-between items-center pl-2">
                <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                  risk.severity === 'HIGH'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/25'
                    : risk.severity === 'MEDIUM'
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/25'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                }`}>
                  {risk.severity} RISK
                </span>

                <span className="text-[9px] text-gray-500 font-mono">Telemetry ID: {risk.id.substring(0, 8).toUpperCase()}</span>
              </div>

              {/* Description */}
              <p className="text-sm font-semibold text-white pl-2 leading-relaxed">
                {risk.description}
              </p>

              {/* Original Clause vs Suggested Rewrite */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2">
                
                {/* Original Clause Text */}
                <div className="space-y-2">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block">Original Clause Text</span>
                  <div className="p-4 rounded-xl bg-[#090d16]/40 border border-white/5 text-xs text-gray-400 font-mono leading-relaxed min-h-[120px] whitespace-pre-wrap select-text">
                    "{risk.clauseText}"
                  </div>
                </div>

                {/* Rewrite Suggestion */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-blue-400 uppercase tracking-widest font-bold block flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Suggested Rewrite
                    </span>
                    <button
                      onClick={() => handleCopyRewrite(risk.suggestedRewrite, risk.id)}
                      className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                      title="Copy Rewrite to Clipboard"
                    >
                      {copiedId === risk.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-300 font-mono leading-relaxed min-h-[120px] whitespace-pre-wrap select-text">
                    "{risk.suggestedRewrite}"
                  </div>
                </div>
              </div>

              {/* Industry standard and Negotiation Recommendation */}
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pl-4">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block mb-1 flex items-center gap-1"><Info className="w-3.5 h-3.5 text-blue-400" /> Industry Comparison</span>
                  <p className="text-gray-400 leading-relaxed font-light">{risk.industryStandard || 'Market standard comparison not specified.'}</p>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block mb-1 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Negotiation Recommendation</span>
                  <p className="text-gray-400 leading-relaxed font-light">{risk.recommendation}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RisksPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs uppercase tracking-widest font-bold">Scanning Risk Center...</span>
      </div>
    }>
      <RisksContent />
    </Suspense>
  );
}
