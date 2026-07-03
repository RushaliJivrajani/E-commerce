'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Link2,
  Loader2,
  X,
  Sparkles
} from 'lucide-react';

interface Banner {
  id: string;
  type: 'Homepage Slider' | 'Offer Banner' | 'Festival Banner' | 'Category Banner' | 'Popup Banner';
  image: string;
  title: string;
  buttonText: string;
  redirectLink: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive';
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  // Form Fields
  const [formType, setFormType] = useState<Banner['type']>('Homepage Slider');
  const [formImage, setFormImage] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formButtonText, setFormButtonText] = useState('Shop Now');
  const [formRedirectLink, setFormRedirectLink] = useState('/');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners');
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners);
      }
    } catch (e) {
      toast.error('Failed to load active promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenAdd = () => {
    setModalType('add');
    setSelectedBanner(null);
    setFormType('Homepage Slider');
    setFormImage('');
    setFormTitle('');
    setFormButtonText('Shop Now');
    setFormRedirectLink('/');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setFormStatus('Active');
    setModalOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setModalType('edit');
    setSelectedBanner(banner);
    setFormType(banner.type);
    setFormImage(banner.image);
    setFormTitle(banner.title);
    setFormButtonText(banner.buttonText);
    setFormRedirectLink(banner.redirectLink);
    setFormStartDate(banner.startDate);
    setFormEndDate(banner.endDate);
    setFormStatus(banner.status);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImage || !formTitle) {
      toast.error('Banner Title and Image Link are required');
      return;
    }

    setSaving(true);
    const payload = {
      type: formType,
      image: formImage,
      title: formTitle,
      buttonText: formButtonText,
      redirectLink: formRedirectLink,
      startDate: formStartDate,
      endDate: formEndDate,
      status: formStatus,
    };

    try {
      const url = modalType === 'add' ? '/api/banners' : `/api/banners/${selectedBanner?.id}`;
      const method = modalType === 'add' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(modalType === 'add' ? 'Banner created!' : 'Banner updated!');
        setModalOpen(false);
        fetchBanners();
      } else {
        toast.error('Failed to save banner details');
      }
    } catch (err) {
      toast.error('Request failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Banner deleted successfully');
        fetchBanners();
      } else {
        toast.error('Failed to delete banner');
      }
    } catch (e) {
      toast.error('Delete request failed');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-400">Loading promotional banner files...</p>
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
            Store Banners & Sliders <ImageIcon className="h-6 w-6 text-slate-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control the website home sliders, popup campaigns, offers, and festival banners.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-slate-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-600/10 hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      {/* Visual Banners Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((ban) => (
          <div
            key={ban.id}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col"
          >
            {/* Banner Preview Frame */}
            <div className="relative h-48 bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0">
              <img src={ban.image} alt={ban.title} className="h-full w-full object-cover" />
              {/* Visual overlays mimicking standard homepage slider buttons */}
              <div className="absolute inset-0 bg-slate-950/40 p-4 flex flex-col justify-end text-white">
                <span className="inline-block bg-slate-600 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded w-max mb-1">{ban.type}</span>
                <h3 className="font-bold text-lg leading-tight truncate">{ban.title}</h3>
                <button type="button" className="mt-2 text-xs font-semibold bg-white text-slate-900 px-3 py-1 rounded w-max">{ban.buttonText}</button>
              </div>
            </div>

            {/* Banner settings detail */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="text-xs space-y-1 text-slate-400">
                <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-500" /> Date Active: <span className="font-bold text-slate-800 dark:text-slate-200">{ban.startDate} to {ban.endDate}</span></div>
                <div className="flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5 text-slate-500" /> Redirects: <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{ban.redirectLink}</span></div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  ban.status === 'Active' ? 'bg-teal-500/10 text-teal-500' : 'bg-slate-500/10 text-slate-500'
                }`}>{ban.status}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEdit(ban)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(ban.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

          </div>
        ))}
        {banners.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8 col-span-2">No promotional banners active. Click Add Banner above to display items.</p>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
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

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {modalType === 'add' ? 'Create Promo Banner' : 'Edit Promo Banner'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Banner Location Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Homepage Slider">Homepage Slider</option>
                    <option value="Offer Banner">Offer Banner</option>
                    <option value="Festival Banner">Festival Banner</option>
                    <option value="Category Banner">Category Banner</option>
                    <option value="Popup Banner">Popup Banner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Banner Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. 50% Off Festive Sale"
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Banner Image Link</label>
                  <input
                    type="text"
                    required
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Action Button Text</label>
                  <input
                    type="text"
                    value={formButtonText}
                    onChange={(e) => setFormButtonText(e.target.value)}
                    placeholder="Shop Now"
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Redirect URL link</label>
                  <input
                    type="text"
                    value={formRedirectLink}
                    onChange={(e) => setFormRedirectLink(e.target.value)}
                    placeholder="/categories/festive-sale"
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">End Date</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
                  {modalType === 'add' ? 'Create Banner' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
