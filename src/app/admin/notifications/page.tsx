'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  BellRing,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Mail,
  MessageSquare
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'Email' | 'SMS' | 'WhatsApp';
  subject?: string;
  body: string;
  isActive: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'Email' | 'SMS' | 'WhatsApp'>('Email');
  const [formSubject, setFormSubject] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates);
      } else {
        toast.error('Failed to load templates');
      }
    } catch (e) {
      toast.error('Error fetching templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenAdd = () => {
    setModalType('add');
    setSelectedTemplate(null);
    setFormName('');
    setFormType('Email');
    setFormSubject('');
    setFormBody('');
    setFormIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (t: NotificationTemplate) => {
    setModalType('edit');
    setSelectedTemplate(t);
    setFormName(t.name);
    setFormType(t.type);
    setFormSubject(t.subject || '');
    setFormBody(t.body);
    setFormIsActive(t.isActive);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Template deleted');
        fetchTemplates();
      } else {
        toast.error('Failed to delete template');
      }
    } catch (e) {
      toast.error('Delete request failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formBody) return;

    setSaving(true);
    try {
      const url = modalType === 'add' ? '/api/notifications' : `/api/notifications/${selectedTemplate?.id}`;
      const method = modalType === 'add' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          type: formType,
          subject: formSubject,
          body: formBody,
          isActive: formIsActive
        }),
      });

      if (res.ok) {
        toast.success(modalType === 'add' ? 'Template created' : 'Template updated');
        fetchTemplates();
        setModalOpen(false);
      } else {
        toast.error('Failed to save template');
      }
    } catch (err) {
      toast.error('Network request failed');
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Email': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'SMS': return <MessageSquare className="h-4 w-4 text-emerald-500" />;
      case 'WhatsApp': return <MessageSquare className="h-4 w-4 text-green-500" />;
      default: return <BellRing className="h-4 w-4 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-400">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2">
            Notification Templates <BellRing className="h-6 w-6 text-slate-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage Email, SMS, and WhatsApp alerts for orders and returns.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <Plus className="h-4 w-4" /> Add Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <div key={t.id} className={`rounded-2xl border ${t.isActive ? 'border-slate-200 dark:border-slate-800' : 'border-rose-500/20 opacity-70'} bg-white shadow-sm dark:bg-slate-900/60 p-5 relative`}>
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {getTypeIcon(t.type)} {t.type}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white mt-1 text-lg">{t.name}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenEdit(t)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(t.id)} className="text-slate-400 hover:text-rose-500 p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {t.type === 'Email' && (
              <div className="mb-3 text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Subject: </span>
                <span className="text-slate-500">{t.subject}</span>
              </div>
            )}
            
            <div className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl max-h-32 overflow-y-auto whitespace-pre-wrap font-mono text-[11px]">
              {t.body}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className={t.isActive ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                {t.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-slate-400">
                Created {new Date(t.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No notification templates defined yet.
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              {modalType === 'add' ? 'Create Template' : 'Edit Template'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Template Name / Trigger</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Order Confirmation"
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Channel Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>

              {formType === 'Email' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Email Subject</label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="Your Rush Fashion Order..."
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Message Body</label>
                <p className="text-[10px] text-slate-400 mb-1">Use variables like {'{customer_name}'}, {'{order_number}'}</p>
                <textarea
                  required
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  rows={6}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs"
                  placeholder="Hi {customer_name}, your order #{order_number} has been confirmed!"
                />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">Active Status</span>
                  <span className="block text-xs text-slate-500">Is this template currently used by the system?</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-slate-600 px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Template
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
