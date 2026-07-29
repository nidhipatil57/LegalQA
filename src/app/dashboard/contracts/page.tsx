'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FileText, UploadCloud, Loader2, Play, Calendar, AlertTriangle, ShieldCheck,
  Building, User, Trash2, ArrowUpRight, CheckCircle2, AlertCircle, Bookmark
} from 'lucide-react';

import { Suspense } from 'react';

function ContractsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramId = searchParams.get('id');

  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch contracts list
  const fetchContracts = (selectIdAfter?: string) => {
    setLoadingList(true);
    fetch('/api/contracts')
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/login';
          }
          throw new Error('Unauthorized or failed to load contracts');
        }
        return res.json();
      })
      .then((data) => {
        const list = data.contracts || [];
        setContracts(list);
        setLoadingList(false);

        // Select contract automatically if parameter or first item is present
        const selectId = selectIdAfter || paramId;
        if (selectId) {
          const match = list.find((c: any) => c.id === selectId);
          if (match) {
            handleSelectContract(match.id);
          }
        }
      })
      .catch((err) => {
        console.error('Fetch contracts failed:', err);
        setLoadingList(false);
      });
  };

  useEffect(() => {
    fetchContracts();
  }, [paramId]);

  const handleSelectContract = (id: string) => {
    setLoadingDetail(true);
    // Push parameter to router safely
    router.replace(`/dashboard/contracts?id=${id}`);
    
    fetch(`/api/contracts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedContract(data.contract);
        setLoadingDetail(false);
      })
      .catch((err) => {
        console.error('Failed to load contract details:', err);
        setLoadingDetail(false);
      });
  };

  // Upload file logic
  const handleUploadFile = async (file: File) => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      // Refresh list and select the newly created contract
      fetchContracts(data.contract.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  // Trigger AI analysis
  const handleRunAnalysis = async () => {
    if (!selectedContract) return;
    setAnalyzing(true);

    try {
      const res = await fetch(`/api/contracts/${selectedContract.id}/analyze`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      // Update state with analyzed contract
      setSelectedContract(data.contract);
      // Refresh list to show updated status
      fetchContracts(selectedContract.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error analyzing contract');
    } finally {
      setAnalyzing(false);
    }
  };

  // Delete contract
  const handleDeleteContract = async () => {
    if (!selectedContract) return;
    if (!confirm(`Are you sure you want to delete "${selectedContract.title}"?`)) return;

    try {
      const res = await fetch(`/api/contracts/${selectedContract.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete contract');

      setSelectedContract(null);
      router.replace('/dashboard/contracts');
      fetchContracts();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error deleting contract');
    }
  };

  // Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[80vh] items-stretch">
      
      {/* Left Column: Upload panel and Contract listing */}
      <div className="lg:col-span-1 space-y-6 flex flex-col">
        
        {/* Upload box */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-blue-500 bg-blue-500/5' 
              : 'border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.02]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleUploadFile(e.target.files[0])}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-xs text-gray-400 font-semibold">Extracting & Chunking Document...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-4 text-gray-400">
              <UploadCloud className="w-10 h-10 text-gray-500 mb-2" />
              <span className="text-sm font-semibold text-white">Drag & drop contract files here</span>
              <span className="text-xs text-gray-500">Supports PDF, DOCX, TXT up to 15MB</span>
            </div>
          )}
        </div>

        {/* Contract list container */}
        <div className="glass-card rounded-2xl p-6 flex-1 flex flex-col min-h-[400px]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Uploaded Agreements</h3>
          
          {loadingList ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Loading files...
            </div>
          ) : contracts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 text-center p-6 space-y-2">
              <FileText className="w-8 h-8 text-gray-700" />
              <p className="text-xs font-semibold">No agreements found in organization.</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[500px] pr-2">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectContract(c.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-left flex justify-between items-center ${
                    selectedContract?.id === c.id
                      ? 'bg-blue-600/10 border-blue-500/30'
                      : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{c.title}</span>
                    <span className="text-[10px] text-gray-500 block font-mono mt-1 uppercase">
                      {c.fileType} • Version {c.version}
                    </span>
                  </div>
                  
                  {/* Status Indicator */}
                  <div>
                    {c.status === 'PENDING_REVIEW' ? (
                      <span className="px-2 py-0.5 rounded text-[8px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold uppercase tracking-wider">
                        Pending
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider">
                        Audited ({c.riskScore}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Detailed analysis panel */}
      <div className="lg:col-span-2 flex flex-col">
        {loadingDetail ? (
          <div className="glass-card rounded-2xl p-8 flex-1 flex flex-col items-center justify-center text-gray-500 text-xs gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> Loading contract audit details...
          </div>
        ) : !selectedContract ? (
          <div className="glass-panel border-white/5 rounded-2xl p-8 flex-1 flex flex-col items-center justify-center text-gray-500 text-center">
            <FileText className="w-12 h-12 text-gray-700 mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Audit Workspace</h4>
            <p className="text-xs max-w-xs text-gray-500">
              Select an uploaded contract from the list to begin audit checks or upload a new corporate document.
            </p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-8 border-white/5 flex-1 flex flex-col space-y-6">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-white/5 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-display mb-1">{selectedContract.title}</h2>
                <div className="flex gap-4 text-xs text-gray-500 font-mono">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {selectedContract.user?.name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedContract.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteContract}
                  className="p-2 bg-red-950/20 border border-red-500/15 hover:border-red-500/30 text-red-400 hover:text-red-300 rounded-xl transition cursor-pointer"
                  title="Delete Contract"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Run Analysis Trigger if Pending */}
            {selectedContract.status === 'PENDING_REVIEW' && !selectedContract.analysis && (
              <div className="p-8 rounded-2xl bg-blue-600/5 border border-blue-500/10 text-center space-y-4 my-6">
                <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto" />
                <h3 className="text-lg font-bold text-white font-display">Contract Audit Required</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  This document has been chunked and vectorized. Click below to run autonomous risk detection and term extractions.
                </p>
                <button
                  onClick={handleRunAnalysis}
                  disabled={analyzing}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Clauses...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      Run AI Contract Analysis
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Analysis Loading Skeletons */}
            {analyzing && (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-white/5 rounded-lg w-1/4" />
                <div className="h-24 bg-white/5 rounded-xl w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-white/5 rounded-xl" />
                  <div className="h-20 bg-white/5 rounded-xl" />
                </div>
              </div>
            )}

            {/* Structured Audit Results */}
            {selectedContract.analysis && !analyzing && (
              <div className="space-y-8 overflow-y-auto max-h-[60vh] pr-2">
                {/* Score and Summary block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Risk score */}
                  <div className="md:col-span-1 rounded-2xl bg-white/[0.02] border border-white/5 p-6 flex flex-col justify-between items-center text-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Overall Risk Score</span>
                    <div className="relative my-4 flex items-center justify-center">
                      <span className="text-5xl font-extrabold text-white font-display">{selectedContract.riskScore}%</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      selectedContract.riskScore > 50 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : selectedContract.riskScore > 20 
                          ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                          : 'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                      {selectedContract.riskScore > 50 ? 'High Risk Exposure' : selectedContract.riskScore > 20 ? 'Moderate Exposure' : 'Low Risk Exposure'}
                    </span>
                  </div>

                  {/* Executive Summary */}
                  <div className="md:col-span-2 rounded-2xl bg-white/[0.02] border border-white/5 p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-2">Executive Summary</span>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {selectedContract.analysis.summary}
                      </p>
                    </div>
                    
                    <div className="flex gap-6 mt-4 border-t border-white/5 pt-4 text-xs font-mono text-gray-500">
                      <div>
                        <span className="block text-[10px] uppercase text-gray-500">Effective Date</span>
                        <span className="text-white text-xs">{selectedContract.analysis.parties[0]} vs {selectedContract.analysis.parties[1]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Term Breakdown Tabs */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Extracted Legal Obligations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Item 1 */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Payment & Invoicing</span>
                      <p className="text-xs text-gray-300 leading-relaxed">{selectedContract.analysis.paymentTerms || 'Not specified.'}</p>
                    </div>

                    {/* Item 2 */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Limitation of Liability</span>
                      <p className="text-xs text-gray-300 leading-relaxed">{selectedContract.analysis.liability || 'Not specified.'}</p>
                    </div>

                    {/* Item 3 */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Termination & Notice</span>
                      <p className="text-xs text-gray-300 leading-relaxed">{selectedContract.analysis.termination || 'Not specified.'}</p>
                    </div>

                    {/* Item 4 */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Governing Law / Jurisdiction</span>
                      <p className="text-xs text-gray-300 leading-relaxed">{selectedContract.analysis.jurisdiction || 'Not specified.'}</p>
                    </div>

                    {/* Item 5 */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Confidentiality Scope</span>
                      <p className="text-xs text-gray-300 leading-relaxed">{selectedContract.analysis.confidentiality || 'Not specified.'}</p>
                    </div>

                    {/* Item 6 */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Intellectual Property</span>
                      <p className="text-xs text-gray-300 leading-relaxed">{selectedContract.analysis.intellectualProperty || 'Not specified.'}</p>
                    </div>
                  </div>
                </div>

                {/* Missing clauses and compliance warning lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  
                  {/* Missing clauses */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-yellow-500 tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Potential Missing Terms
                    </h4>
                    <div className="space-y-1.5">
                      {selectedContract.analysis.missingClauses && selectedContract.analysis.missingClauses.length > 0 ? (
                        selectedContract.analysis.missingClauses.map((c: string, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-yellow-950/10 border-l-2 border-yellow-500 text-xs text-yellow-300 font-medium">
                            {c}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 italic">No missing clauses highlighted.</p>
                      )}
                    </div>
                  </div>

                  {/* Compliance issues */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Compliance Warnings
                    </h4>
                    <div className="space-y-1.5">
                      {selectedContract.analysis.complianceIssues && selectedContract.analysis.complianceIssues.length > 0 ? (
                        selectedContract.analysis.complianceIssues.map((c: string, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-red-950/10 border-l-2 border-red-500 text-xs text-red-300 font-medium">
                            {c}
                          </div>
                        ))
                      ) : (
                        <div className="p-2.5 rounded-lg bg-green-950/10 border-l-2 border-green-500 text-xs text-green-400 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> No standard compliance alerts found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct link actions */}
                <div className="flex gap-4 pt-6 border-t border-white/5">
                  <Link href={`/dashboard/risks?id=${selectedContract.id}`} className="px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-semibold rounded-xl transition flex items-center gap-2 border border-blue-500/15">
                    View Risks Timeline <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href={`/dashboard/chat?id=${selectedContract.id}`} className="px-4 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold rounded-xl transition flex items-center gap-2 border border-indigo-500/15">
                    Chat with Contract <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContractsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-gray-400"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" /> Loading Workspace Contracts...</div>}>
      <ContractsContent />
    </Suspense>
  );
}
