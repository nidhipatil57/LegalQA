'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen, Search, Filter, Plus, Loader2, Sparkles,
  FileText, Bookmark, ClipboardList, AlertCircle, X, Check
} from 'lucide-react';

export default function KnowledgePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Add item state
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('NDA Guidelines');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = [
    'NDA Guidelines',
    'Vendor SOPs',
    'Compliance Policies',
    'Standard Templates',
    'Governing Benchmarks',
  ];

  const fetchItems = () => {
    setLoading(true);
    let url = '/api/knowledge';
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.append('q', searchQuery);
    }
    if (selectedCategory) {
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

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !category) return;

    setSaving(true);
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category, tags }),
      });

      if (!res.ok) throw new Error('Failed to create template');

      setTitle('');
      setContent('');
      setCategory('NDA Guidelines');
      setTagsInput('');
      setAddOpen(false);
      
      fetchItems();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error creating item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Ambient Radial Blur */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Banner */}
      <div className="spatial-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Legal Knowledge Base <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </h1>
          <p className="text-sm text-gray-300 font-light mt-1">Search and audit past templates, legal guidelines, and standard compliance SOPs.</p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all cursor-pointer hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" /> Add Template SOP
        </button>
      </div>

      {/* Search Bar & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="md:col-span-3 flex items-center gap-2 bg-white/[0.03] border border-white/10 focus-within:border-blue-500/50 rounded-xl px-4 py-2.5 transition-all duration-300 shadow-sm">
          <Search className="w-4 h-4 text-blue-400" />
          <input
            type="text"
            placeholder="Search guidelines semantically... (e.g. indemnity cap limits)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white text-xs outline-none placeholder-gray-500 font-medium"
          />
          <button type="submit" className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer hover:scale-[1.02]">
            Vector Search
          </button>
        </form>

        {/* Filter Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3.5 py-3 text-xs font-bold rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none cursor-pointer hover:border-blue-500/40 transition-colors shadow-sm"
        >
          <option value="" className="bg-[#090d16]">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-[#090d16]">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500 space-y-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs uppercase tracking-widest font-bold text-blue-400">Scanning vector database...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="spatial-card rounded-2xl p-16 text-center text-gray-400 space-y-3 max-w-md mx-auto">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto shadow-md">
            <BookOpen className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-extrabold text-white font-display">No Guidelines Found</h4>
          <p className="text-xs text-gray-300 font-light">Add standard guidelines or templates to search them semantically during contract review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.id} className="spatial-card rounded-2xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[8px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-extrabold uppercase tracking-wider">
                    {item.category}
                  </span>
                  
                  {item.similarity !== undefined && (
                    <span className="text-[9px] text-emerald-300 font-mono flex items-center gap-1 font-bold bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/20 rounded-full">
                      <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> Vector Match: {Math.round(item.similarity * 100)}%
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-white mb-2 font-display">{item.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-4 whitespace-pre-line font-light">
                  {item.content}
                </p>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/[0.06]">
                  {item.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[9px] text-blue-300 font-mono font-bold">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}


      {/* CREATE MODAL */}
      {addOpen && (
        <div className="fixed inset-0 bg-[#030712]/80 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="w-full max-w-lg glass-panel border-white/10 rounded-2xl p-8 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white font-display mb-2">Add Template Guideline</h3>
            <p className="text-xs text-gray-500 mb-6 font-light">Create a knowledge node that will automatically index vector embeddings.</p>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Template Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Standard Indemnity Reciprocal Clause"
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl bg-white/[0.03] border border-white/10 text-white outline-none cursor-pointer hover:border-white/20 transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-[#090d16]">{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Tags (comma split)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="nda, indemnity, caps"
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Guideline Content</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the template clause text, legal policy, or compliance SOP rules..."
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Vectorizing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Node
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
