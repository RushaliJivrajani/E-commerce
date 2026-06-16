'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FileText,
  Save,
  Loader2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

interface WebsiteContent {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export default function ContentPage() {
  const [pages, setPages] = useState<WebsiteContent[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor states
  const [selectedPageId, setSelectedPageId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        setPages(data.contents);
        if (data.contents.length > 0) {
          // Select first page by default
          setSelectedPageId(data.contents[0].id);
          setEditTitle(data.contents[0].title);
          setEditContent(data.contents[0].content);
        }
      }
    } catch (e) {
      toast.error('Failed to load static pages content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Update fields when selecting a different page
  const handleSelectPage = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      setSelectedPageId(id);
      setEditTitle(page.title);
      setEditContent(page.content);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPageId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/content/${selectedPageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (res.ok) {
        toast.success('Page content updated successfully!');
        // Update local state list
        const updatedList = pages.map(p => {
          if (p.id === selectedPageId) {
            return { ...p, title: editTitle, content: editContent, lastUpdated: new Date().toISOString() };
          }
          return p;
        });
        setPages(updatedList);
      } else {
        toast.error('Failed to update page content');
      }
    } catch (err) {
      toast.error('Error sending update request');
    } finally {
      setSaving(false);
    }
  };

  const selectedPage = pages.find(p => p.id === selectedPageId);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-400">Loading website layout content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2">
            Website Content Editor <FileText className="h-6 w-6 text-slate-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Edit text copies for static website policies, FAQ portals, About pages, and return terms.
          </p>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl">
        
        {/* Left Side: Pages selector list */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-855 pb-2 mb-2">Static Pages</span>
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPage(p.id)}
              className={`w-full text-left rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide border transition-all block ${
                selectedPageId === p.id
                  ? 'bg-slate-600 text-white shadow border-slate-600'
                  : 'text-slate-600 hover:bg-slate-100 border-transparent dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Right Side: Textarea Editor */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          {selectedPage ? (
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> HTML/Markdown Editor</span>
                {selectedPage.lastUpdated && (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Updated: {new Date(selectedPage.lastUpdated).toLocaleDateString()}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Page Document Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Document Code Body (supports HTML)</label>
                <textarea
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={12}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Informative Tip Box */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 p-3 text-xs text-slate-400 flex gap-2">
                <Info className="h-4 w-4 text-slate-500 shrink-0" />
                <span>You can edit using raw HTML layout blocks. Changes take effect on the storefront instantly after saving.</span>
              </div>

              {/* Save button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-slate-600 px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Page Content
                </button>
              </div>

            </form>
          ) : (
            <p className="text-slate-400 text-xs text-center py-8">Select a page document from the list to begin editing.</p>
          )}
        </div>

      </div>

    </div>
  );
}
