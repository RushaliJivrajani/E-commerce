'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Tag,
  Search,
  Eye,
  EyeOff,
  Loader2,
  X,
  FileText
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  image?: string;
  banner?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: 'Active' | 'Inactive';
  position: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({
    'cat_1': true, // Expand women by default
    'cat_1_sub1': true
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formParentId, setFormParentId] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formBanner, setFormBanner] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formPosition, setFormPosition] = useState('0');
  const [saving, setSaving] = useState(false);

  // Load Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (e) {
      toast.error('Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Toggle Node Expand
  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Add Modal
  const handleOpenAdd = (parentId?: string) => {
    setModalType('add');
    setSelectedCategory(null);
    setFormName('');
    setFormParentId(parentId || '');
    setFormImage('');
    setFormBanner('');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormStatus('Active');
    setFormPosition('0');
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (category: Category) => {
    setModalType('edit');
    setSelectedCategory(category);
    setFormName(category.name);
    setFormParentId(category.parentId || '');
    setFormImage(category.image || '');
    setFormBanner(category.banner || '');
    setFormSeoTitle(category.seoTitle || '');
    setFormSeoDescription(category.seoDescription || '');
    setFormStatus(category.status);
    setFormPosition(category.position.toString());
    setModalOpen(true);
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) {
      toast.error('Category Name is required');
      return;
    }

    setSaving(true);
    const payload = {
      name: formName,
      parentId: formParentId || undefined,
      image: formImage,
      banner: formBanner,
      seoTitle: formSeoTitle,
      seoDescription: formSeoDescription,
      status: formStatus,
      position: Number(formPosition),
    };

    try {
      const url = modalType === 'add' ? '/api/categories' : `/api/categories/${selectedCategory?.id}`;
      const method = modalType === 'add' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(modalType === 'add' ? 'Category created!' : 'Category updated!');
        setModalOpen(false);
        fetchCategories();
      } else {
        toast.error(data.message || 'Error processing request');
      }
    } catch (err) {
      toast.error('Request failed');
    } finally {
      setSaving(false);
    }
  };

  // Delete Category
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All child subcategories will be unlinked.')) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete category');
      }
    } catch (e) {
      toast.error('Delete request failed');
    }
  };

  // Filter Categories by Search Query
  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group Categories hierarchically
  const mainCategories = categories.filter(c => !c.parentId);
  const getSubCategories = (parentId: string) => categories.filter(c => c.parentId === parentId);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 glass-panel p-8 rounded-2xl border border-white/10">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm font-semibold text-slate-400">Loading dynamic hierarchy tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2 text-glow">
            Categories Directory <FolderTree className="h-6 w-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Build and organize infinite nested levels of Main, Sub, and Child categories.
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center gap-2 rounded-xl bg-indigo-400 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:bg-indigo-300 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Root Category
        </button>
      </div>

      {/* Directory Filter Bar */}
      <div className="flex items-center gap-3 max-w-md bg-white/5 rounded-xl border border-white/10 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 transition-shadow">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Filter categories by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none text-white placeholder-slate-500 font-medium"
        />
      </div>

      {/* Category Tree Grid */}
      <div className="rounded-2xl border border-white/10 glass-panel p-6 shadow-sm">
        <h2 className="text-lg font-bold text-white mb-6">Hierarchy Tree</h2>

        {searchQuery ? (
          /* Search results matching list flat */
          <div className="space-y-2">
            {filtered.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-indigo-400" />
                  <div>
                    <span className="font-semibold text-sm text-white">{cat.name}</span>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">slug: {cat.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenEdit(cat)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-sm text-slate-400">No categories matching "{searchQuery}"</p>}
          </div>
        ) : (
          /* Nested Tree Directory Node Render */
          <div className="space-y-4">
            {mainCategories.map((mainCat) => {
              const mainExpanded = !!expandedNodes[mainCat.id];
              const subs = getSubCategories(mainCat.id);

              return (
                <div key={mainCat.id} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                  
                  {/* ROOT ROW */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleExpand(mainCat.id)} className="text-slate-400 hover:text-white p-1 transition-colors">
                        {subs.length > 0 ? (
                          mainExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                        ) : (
                          <div className="w-4" />
                        )}
                      </button>
                      {mainExpanded && subs.length > 0 ? <FolderOpen className="h-5 w-5 text-indigo-400" /> : <Folder className="h-5 w-5 text-indigo-400/80" />}
                      <span className="font-bold text-white text-base">{mainCat.name}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 ml-2">Root Position {mainCat.position}</span>
                      {mainCat.status === 'Inactive' && <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold text-rose-400 ml-2">Inactive</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAdd(mainCat.id)}
                        className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-indigo-400 bg-white/5 border border-white/10 px-2 py-1 rounded-lg transition-colors"
                        title="Add Subcategory"
                      >
                        <Plus className="h-3.5 w-3.5" /> Sub
                      </button>
                      <button onClick={() => handleOpenEdit(mainCat)} className="p-1 text-slate-400 hover:text-white transition-colors"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(mainCat.id)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>

                  {/* SUBS TREE RENDER */}
                  {mainExpanded && subs.length > 0 && (
                    <div className="pl-6 border-l-2 border-dashed border-white/20 space-y-3 mt-2">
                      {subs.map((subCat) => {
                        const subExpanded = !!expandedNodes[subCat.id];
                        const childs = getSubCategories(subCat.id);

                        return (
                          <div key={subCat.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleExpand(subCat.id)} className="text-slate-400 hover:text-white p-1 transition-colors">
                                  {childs.length > 0 ? (
                                    subExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                                  ) : (
                                    <div className="w-4" />
                                  )}
                                </button>
                                {subExpanded && childs.length > 0 ? <FolderOpen className="h-4 w-4 text-indigo-400/80" /> : <Folder className="h-4 w-4 text-indigo-400/60" />}
                                <span className="font-semibold text-sm text-white">{subCat.name}</span>
                                {subCat.status === 'Inactive' && <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1 py-0.5 text-[8px] font-bold text-rose-400 ml-2">Inactive</span>}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenAdd(subCat.id)}
                                  className="flex items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-indigo-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded transition-colors"
                                  title="Add Child Category"
                                >
                                  <Plus className="h-3 w-3" /> Child
                                </button>
                                <button onClick={() => handleOpenEdit(subCat)} className="p-1 text-slate-400 hover:text-white transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                                <button onClick={() => handleDelete(subCat.id)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                            </div>

                            {/* CHILDS TREE RENDER */}
                            {subExpanded && childs.length > 0 && (
                              <div className="pl-6 border-l-2 border-dotted border-white/20 space-y-2 mt-1">
                                {childs.map((childCat) => (
                                  <div key={childCat.id} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-2">
                                      <Tag className="h-3.5 w-3.5 text-indigo-400/60" />
                                      <span className="text-xs text-white font-medium">{childCat.name}</span>
                                      {childCat.status === 'Inactive' && <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1 py-0.5 text-[8px] font-bold text-rose-400">Inactive</span>}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => handleOpenEdit(childCat)} className="p-1 text-slate-400 hover:text-white transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                                      <button onClick={() => handleDelete(childCat.id)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}

            {mainCategories.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No categories created yet. Click above to start building.</p>
            )}
          </div>
        )}
      </div>

      {/* --- ADD/EDIT MODAL DIALOGUE --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {modalType === 'add' ? 'Add New Category' : 'Edit Category'}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Category Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Category Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Sarees, Western Wear"
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Parent Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Parent Category (Optional)</label>
                  <select
                    value={formParentId}
                    onChange={(e) => setFormParentId(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="">None (Root Category)</option>
                    {categories
                      .filter(c => c.id !== selectedCategory?.id) // Prevent loop dependencies
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} {cat.parentId ? '(Sub)' : '(Root)'}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Position Order */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Position Position</label>
                  <input
                    type="number"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    placeholder="0"
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                  <div className="mt-1.5 flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={formStatus === 'Active'}
                        onChange={() => setFormStatus('Active')}
                        className="text-slate-600 focus:ring-slate-500"
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                      <input
                        type="radio"
                        name="status"
                        value="Inactive"
                        checked={formStatus === 'Inactive'}
                        onChange={() => setFormStatus('Inactive')}
                        className="text-slate-600 focus:ring-slate-500"
                      />
                      <span>Inactive</span>
                    </label>
                  </div>
                </div>

                {/* Thumbnail Image */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Image Link</label>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Header Banner */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Banner Image Link</label>
                  <input
                    type="text"
                    value={formBanner}
                    onChange={(e) => setFormBanner(e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                {/* SEO Title */}
                <div className="sm:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <FileText className="h-3.5 w-3.5" /> SEO Search Configuration
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Meta SEO Title</label>
                  <input
                    type="text"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    placeholder="Search Engine Page Title"
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Meta SEO Description</label>
                  <input
                    type="text"
                    value={formSeoDescription}
                    onChange={(e) => setFormSeoDescription(e.target.value)}
                    placeholder="Short summary for Google search"
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-slate-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modalType === 'add' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
