'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen, Search, Filter, Plus, Loader2, Sparkles,
  FileText, Bookmark, ClipboardList, AlertCircle, X, Check,
  Download, Eye, Copy, Trash2, Tag, ShieldCheck, Clock,
  ArrowUpRight, Folder, RefreshCw, ChevronRight, FileCode,
  SlidersHorizontal, CheckCircle2, History, Layers, Share2,
  ListFilter, Star, AlertTriangle, UploadCloud
} from 'lucide-react';

export default function KnowledgePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCollection, setSelectedCollection] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');

  // Bookmarks (My Library)
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Preview / Viewer Modal State
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'viewer'>('overview');
  const [docSearch, setDocSearch] = useState('');
  const [copied, setCopied] = useState(false);

  // Upload / Create Modal State
  const [uploadOpen, setAddOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Contract Templates');
  const [collection, setCollection] = useState('Corporate');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);

  const categories = [
    'All Categories',
    'Contract Templates',
    'Company Policies',
    'Compliance Documents',
    'Legal SOPs',
    'Internal Playbooks',
  ];

  const collections = [
    'All',
    'Corporate',
    'Employment',
    'Commercial',
    'Technology',
    'Procurement',
    'Compliance',
    'Privacy',
    'Finance',
    'Litigation',
    'IP',
    'My Library'
  ];

  const presetQueries = [
    'payment obligations',
    'termination notice',
    'limitation of liability',
    'GDPR breach',
    'vendor onboarding',
    'confidentiality',
    'RBI outsourcing',
    'force majeure'
  ];

  // Load Bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('legalqa_knowledge_bookmarks');
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (bookmarks.includes(id)) {
      updated = bookmarks.filter((b) => b !== id);
    } else {
      updated = [...bookmarks, id];
    }
    setBookmarks(updated);
    try {
      localStorage.setItem('legalqa_knowledge_bookmarks', JSON.stringify(updated));
    } catch (err) {}
  };

  const fetchItems = () => {
    setLoading(true);
    let url = '/api/knowledge';
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.append('q', searchQuery);
    }
    if (selectedCategory && selectedCategory !== 'All Categories') {
      params.append('category', selectedCategory);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch knowledge base failed:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handlePresetClick = (preset: string) => {
    setSearchQuery(preset);
    setLoading(true);
    fetch(`/api/knowledge?q=${encodeURIComponent(preset)}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      });
  };

  // Helper to parse item structured content or plain text
  const getItemDetails = (item: any) => {
    if (!item) return {};
    let parsed: any = {};
    try {
      parsed = JSON.parse(item.content);
    } catch (e) {
      parsed = {
        body: item.content,
        summary: item.content.substring(0, 200) + '...'
      };
    }
    return {
      version: parsed.version || 'v1.0',
      author: parsed.author || 'Legal Team',
      status: parsed.status || 'APPROVED',
      collection: parsed.collection || 'Corporate',
      riskLevel: parsed.riskLevel || 'LOW',
      missingClauses: parsed.missingClauses || [],
      complianceCoverage: parsed.complianceCoverage || 95,
      clauseCount: parsed.clauseCount || 10,
      readingTime: parsed.readingTime || '5 min',
      relatedDocs: parsed.relatedDocs || [],
      versionHistory: parsed.versionHistory || [
        {
          version: parsed.version || 'v1.0',
          date: new Date(item.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          author: parsed.author || 'Legal Team',
          changes: 'Initial published version',
          status: parsed.status || 'APPROVED'
        }
      ],
      summary: parsed.summary || item.content.substring(0, 200),
      body: parsed.body || item.content
    };
  };

  // Filter items client-side for collection, status, and risk
  const filteredItems = items.filter((item) => {
    const details = getItemDetails(item);

    if (selectedCollection === 'My Library') {
      if (!bookmarks.includes(item.id)) return false;
    } else if (selectedCollection !== 'All') {
      if (details.collection !== selectedCollection) return false;
    }

    if (selectedStatus !== 'All') {
      if (details.status !== selectedStatus) return false;
    }

    if (selectedRisk !== 'All') {
      if (details.riskLevel !== selectedRisk) return false;
    }

    return true;
  });

  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'updatedAt') return new Date(b.updatedAt || Date.now()).getTime() - new Date(a.updatedAt || Date.now()).getTime();
    if (sortBy === 'relevance' && a.similarity !== undefined && b.similarity !== undefined) {
      return b.similarity - a.similarity;
    }
    return 0;
  });

  // Handle File Upload Simulation
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      
      // Read text content if available
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) setContent(text);
      };
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        setContent(`# ${file.name}\n\n## SECTION 1. OVERVIEW & SCOPE\n1.1 Mandatory operational guidelines and legal compliance obligations contained within ${file.name}.\n\n## SECTION 2. INTELLECTUAL PROPERTY & LIABILITY\n2.1 Standard terms defining ownership, warranty, and indemnification caps.`);
      }
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setSaving(true);
    setAiProcessing(true);

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category,
          collection,
          tags: tags.length > 0 ? tags : ['legal', category.toLowerCase().replace(/\s+/g, '-')],
          isUpload: !!uploadFile,
          fileType: uploadFile ? uploadFile.name.split('.').pop()?.toUpperCase() : 'DOCX'
        }),
      });

      if (!res.ok) throw new Error('Failed to index document');

      setTitle('');
      setContent('');
      setCategory('Contract Templates');
      setCollection('Corporate');
      setTagsInput('');
      setUploadFile(null);
      setAddOpen(false);

      fetchItems();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error creating document');
    } finally {
      setSaving(false);
      setAiProcessing(false);
    }
  };

  const handleDeleteItem = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document from Knowledge Base?')) return;

    try {
      const res = await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeItem?.id === id) setActiveItem(null);
        fetchItems();
      }
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  const handleDuplicateItem = async (item: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const details = getItemDetails(item);
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${item.title} (Copy)`,
          content: details.body,
          category: item.category,
          collection: details.collection,
          tags: [...(item.tags || []), 'copy'],
          summary: details.summary,
          version: `${details.version}-draft`
        })
      });
      if (res.ok) fetchItems();
    } catch (err) {}
  };

  const handleDownloadDoc = (item: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const details = getItemDetails(item);
    const element = document.createElement('a');
    const file = new Blob([details.body], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${item.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in relative pb-12">
      {/* Ambient Radial Blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. Header Banner */}
      <div className="spatial-card rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-300 mb-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Vector RAG Index Online • {items.length} Knowledge Assets
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Legal Knowledge Management System
            </h1>
            <p className="text-sm text-gray-300 font-light mt-1.5 max-w-3xl leading-relaxed">
              Centralized enterprise repository for approved contract templates, company policies, legal SOPs, compliance guidelines, and negotiation playbooks. Indexed for AI RAG semantic search.
            </p>
          </div>

          <button
            onClick={() => setAddOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2.5 shadow-[0_0_25px_rgba(59,130,246,0.35)] transition-all duration-300 cursor-pointer hover:scale-[1.02] shrink-0"
          >
            <UploadCloud className="w-4 h-4" /> Upload Knowledge Document
          </button>
        </div>
      </div>

      {/* 2. Semantic Search Bar & Preset Quick-Queries */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 focus-within:border-blue-500/60 rounded-2xl px-5 py-3.5 transition-all duration-300 shadow-lg">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            placeholder="Type semantic query... (e.g. payment obligations, termination notice, limitation of liability, GDPR breach)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder-gray-500 font-medium"
          />
          {searchQuery && (
            <button type="button" onClick={() => { setSearchQuery(''); fetchItems(); }} className="text-gray-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button type="submit" className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer hover:scale-[1.02] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Vector Search
          </button>
        </form>

        {/* Preset Query Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-blue-400" /> Quick RAG Prompts:
          </span>
          {presetQueries.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                searchQuery === preset
                  ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                  : 'bg-white/[0.02] hover:bg-white/[0.06] text-blue-300 border-white/10 hover:border-blue-500/30'
              }`}
            >
              #{preset}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Collections Folder Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/[0.06]">
        {collections.map((col) => {
          const isSelected = selectedCollection === col;
          return (
            <button
              key={col}
              onClick={() => setSelectedCollection(col)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {col === 'My Library' ? <Star className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} /> : <Folder className="w-3.5 h-3.5 text-blue-400" />}
              {col}
              {col === 'My Library' && (
                <span className="ml-1 px-1.5 py-0.2 text-[9px] rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {bookmarks.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Multi-Dimensional Enterprise Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06]">
        {/* Category Filter */}
        <div className="space-y-1">
          <label className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500 block">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[#090d16] border border-white/10 text-white outline-none cursor-pointer hover:border-blue-500/40 transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1">
          <label className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500 block">Approval Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[#090d16] border border-white/10 text-white outline-none cursor-pointer hover:border-blue-500/40 transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Risk Filter */}
        <div className="space-y-1">
          <label className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500 block">Risk Level</label>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[#090d16] border border-white/10 text-white outline-none cursor-pointer hover:border-blue-500/40 transition-colors"
          >
            <option value="All">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="space-y-1">
          <label className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500 block">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[#090d16] border border-white/10 text-white outline-none cursor-pointer hover:border-blue-500/40 transition-colors"
          >
            <option value="relevance">Vector Relevance / Similarity</option>
            <option value="updatedAt">Last Updated</option>
            <option value="title">Document Title</option>
          </select>
        </div>
      </div>

      {/* 5. Document Knowledge Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[45vh] text-gray-400 space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
            <Sparkles className="w-5 h-5 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="text-xs uppercase tracking-[0.2em] font-extrabold text-blue-400">Querying Vector Store & Indexing Knowledge Nodes...</span>
        </div>
      ) : sortedItems.length === 0 ? (
        /* CUSTOM EMPTY STATE */
        <div className="spatial-card rounded-3xl p-12 sm:p-16 text-center max-w-2xl mx-auto space-y-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] my-8">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto shadow-xl">
            <BookOpen className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-extrabold text-white font-display">Your Legal Knowledge Repository is Ready</h3>
            <p className="text-xs text-gray-300 font-light leading-relaxed max-w-xl mx-auto">
              Upload contract templates, SOPs, policies, and compliance documents to build an AI-powered legal knowledge base. Every uploaded document will be indexed, embedded, and made searchable through semantic vector search.
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center gap-2 shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all cursor-pointer hover:scale-[1.02]"
          >
            <UploadCloud className="w-4 h-4" /> Upload Knowledge Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedItems.map((item) => {
            const details = getItemDetails(item);
            const isBookmarked = bookmarks.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => { setActiveItem(item); setActiveTab('overview'); }}
                className="spatial-card rounded-2xl p-6 flex flex-col justify-between space-y-5 relative overflow-hidden group cursor-pointer border border-white/[0.08] hover:border-blue-500/40 transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_45px_rgba(59,130,246,0.15)]"
              >
                {/* Top Rim Highlight */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent group-hover:via-blue-500/60" />

                <div>
                  {/* Category & Status Header */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Vector Similarity Pill */}
                      {item.similarity !== undefined && (
                        <span className="text-[9px] text-emerald-300 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> {Math.round(item.similarity * 100)}%
                        </span>
                      )}

                      {/* Bookmark Icon */}
                      <button
                        onClick={(e) => toggleBookmark(item.id, e)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isBookmarked ? 'text-amber-400 bg-amber-500/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Version */}
                  <h3 className="text-base font-extrabold text-white mb-1.5 font-display group-hover:text-blue-300 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {/* Metadata Sub-Bar */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 font-mono mb-3 border-b border-white/[0.06] pb-3">
                    <span><strong className="text-gray-300">Ver:</strong> {details.version}</span>
                    <span>•</span>
                    <span><strong className="text-gray-300">Owner:</strong> {details.author}</span>
                    <span>•</span>
                    <span>{new Date(item.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>

                  {/* AI Summary */}
                  <p className="text-xs text-gray-300 leading-relaxed font-light line-clamp-3 mb-4">
                    {details.summary}
                  </p>

                  {/* AI Metric Chips */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[9px] font-mono mb-4">
                    <div>
                      <span className="text-gray-500 block uppercase font-bold">Risk Level</span>
                      <span className={`font-extrabold uppercase ${
                        details.riskLevel === 'HIGH' ? 'text-red-400' : details.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {details.riskLevel}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block uppercase font-bold">Clauses</span>
                      <span className="font-extrabold text-white">{details.clauseCount} Terms</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block uppercase font-bold">Coverage</span>
                      <span className="font-extrabold text-blue-300">{details.complianceCoverage}%</span>
                    </div>
                  </div>
                </div>

                {/* Tags & Quick Actions Bar */}
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/10 text-[9px] text-gray-400 font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <button
                      onClick={() => { setActiveItem(item); setActiveTab('overview'); }}
                      className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDownloadDoc(item, e)}
                        title="Download Markdown"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDuplicateItem(item, e)}
                        title="Duplicate"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. SLIDE-OVER PREVIEW & TEMPLATE VIEWER DRAWER */}
      {activeItem && (
        <div className="fixed inset-0 bg-[#030712]/80 backdrop-blur-md z-[100] flex justify-end animate-fade-in">
          <div className="w-full max-w-4xl h-full glass-panel border-l border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl relative">
            {/* Top Light Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            {/* Drawer Header */}
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-white/[0.01]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {activeItem.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                    getItemDetails(activeItem).status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {getItemDetails(activeItem).status}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white font-display">{activeItem.title}</h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Tabs Switcher */}
                <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('viewer')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'viewer' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  >
                    Template Viewer
                  </button>
                </div>

                <button
                  onClick={() => setActiveItem(null)}
                  className="p-2 text-gray-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'overview' ? (
                <div className="space-y-6">
                  {/* Executive AI Summary Box */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" /> AI Executive Summary
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">
                      {getItemDetails(activeItem).summary}
                    </p>
                  </div>

                  {/* AI Insights Meters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-gray-500">Risk Exposure</span>
                      <span className={`text-lg font-extrabold block uppercase ${
                        getItemDetails(activeItem).riskLevel === 'HIGH' ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {getItemDetails(activeItem).riskLevel} RISK
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-gray-500">Compliance Coverage</span>
                      <span className="text-lg font-extrabold text-blue-300 block">{getItemDetails(activeItem).complianceCoverage}%</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-gray-500">Clause Count</span>
                      <span className="text-lg font-extrabold text-white block">{getItemDetails(activeItem).clauseCount} Clauses</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-gray-500">Est. Read Time</span>
                      <span className="text-lg font-extrabold text-purple-300 block">{getItemDetails(activeItem).readingTime}</span>
                    </div>
                  </div>

                  {/* Metadata Table */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Document Metadata</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase font-bold">Author / Owner</span>
                        <span className="text-white font-semibold">{getItemDetails(activeItem).author}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase font-bold">Current Version</span>
                        <span className="text-blue-300 font-semibold">{getItemDetails(activeItem).version}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase font-bold">Collection Folder</span>
                        <span className="text-gray-300">{getItemDetails(activeItem).collection}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase font-bold">Last Updated</span>
                        <span className="text-gray-300">{new Date(activeItem.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Potential Missing Terms */}
                  {getItemDetails(activeItem).missingClauses && getItemDetails(activeItem).missingClauses.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase text-yellow-400 tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" /> Audit Carve-outs & Missing Clauses
                      </h4>
                      <div className="space-y-2">
                        {getItemDetails(activeItem).missingClauses.map((c: string, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs text-gray-300 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shrink-0" />
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Documents */}
                  {getItemDetails(activeItem).relatedDocs && getItemDetails(activeItem).relatedDocs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase text-white tracking-wider">Recommended Related Templates</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {getItemDetails(activeItem).relatedDocs.map((docName: string, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-blue-500/30 transition-all flex items-center justify-between text-xs text-gray-300 font-semibold cursor-pointer">
                            <span>{docName}</span>
                            <ChevronRight className="w-4 h-4 text-blue-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Version History Log */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <History className="w-4 h-4 text-blue-400" /> Version History Log
                    </h4>
                    <div className="space-y-3">
                      {getItemDetails(activeItem).versionHistory.map((ver: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1 text-xs font-mono">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-blue-300">{ver.version}</span>
                            <span className="text-[10px] text-gray-500">{ver.date} • {ver.author}</span>
                          </div>
                          <p className="text-gray-300 text-xs font-sans font-light">{ver.changes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* TEMPLATE VIEWER TAB */
                <div className="space-y-4">
                  {/* Viewer Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/[0.08]">
                    <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 flex-1">
                      <Search className="w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search clauses in document..."
                        value={docSearch}
                        onChange={(e) => setDocSearch(e.target.value)}
                        className="bg-transparent border-none text-xs text-white outline-none placeholder-gray-500 font-medium w-full"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(getItemDetails(activeItem).body)}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy Text'}
                      </button>
                      <button
                        onClick={() => handleDownloadDoc(activeItem)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  </div>

                  {/* Rendered Complete Legal Text */}
                  <div className="p-6 rounded-2xl bg-[#070b14] border border-white/[0.08] font-sans text-xs text-gray-300 leading-relaxed space-y-4 max-h-[60vh] overflow-y-auto select-text scrollbar-thin">
                    {getItemDetails(activeItem).body.split('\n').map((paragraph: string, idx: number) => {
                      if (paragraph.startsWith('# ')) {
                        return <h1 key={idx} className="text-base font-extrabold text-white font-display border-b border-white/10 pb-2 mt-4">{paragraph.replace('# ', '')}</h1>;
                      }
                      if (paragraph.startsWith('## ')) {
                        return <h2 key={idx} className="text-sm font-bold text-blue-300 font-display mt-4 mb-1">{paragraph.replace('## ', '')}</h2>;
                      }
                      if (paragraph.startsWith('### ')) {
                        return <h3 key={idx} className="text-xs font-bold text-indigo-300 mt-2">{paragraph.replace('### ', '')}</h3>;
                      }
                      return <p key={idx} className="font-light">{paragraph}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. UPLOAD & CREATE KNOWLEDGE DOCUMENT MODAL */}
      {uploadOpen && (
        <div className="fixed inset-0 bg-[#030712]/80 backdrop-blur-md flex items-center justify-center z-[100] px-4 animate-fade-in">
          <div className="w-full max-w-xl glass-panel border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white font-display">Upload Knowledge Asset</h3>
                <p className="text-xs text-gray-400 font-light mt-0.5">Index contract templates, policies, SOPs, or guidelines into RAG vector store.</p>
              </div>
              <button onClick={() => setAddOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              {/* File Dropzone */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border-2 border-dashed border-white/10 hover:border-blue-500/50 text-center transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-white block">
                  {uploadFile ? uploadFile.name : 'Click to select or drag & drop files'}
                </span>
                <span className="text-[10px] text-gray-500 font-mono block mt-1">Supports PDF, DOCX, TXT, Markdown (Max 15MB)</span>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Software License Agreement v2"
                  className="w-full glass-input text-xs font-medium"
                />
              </div>

              {/* Classification Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-bold rounded-xl bg-[#090d16] border border-white/10 text-white outline-none cursor-pointer"
                  >
                    <option value="Contract Templates">Contract Templates</option>
                    <option value="Company Policies">Company Policies</option>
                    <option value="Compliance Documents">Compliance Documents</option>
                    <option value="Legal SOPs">Legal SOPs</option>
                    <option value="Internal Playbooks">Internal Playbooks</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Collection Folder</label>
                  <select
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-bold rounded-xl bg-[#090d16] border border-white/10 text-white outline-none cursor-pointer"
                  >
                    {collections.filter(c => c !== 'All' && c !== 'My Library').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Tags (comma split)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="nda, gdpr, procurement, compliance"
                  className="w-full glass-input text-xs font-mono"
                />
              </div>

              {/* Content / Body Text */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Document Legal Text</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste complete legal template text, clauses, or policy rules..."
                  className="w-full glass-input text-xs font-mono leading-relaxed"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" /> Vectorizing Document...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Index Knowledge Asset
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
