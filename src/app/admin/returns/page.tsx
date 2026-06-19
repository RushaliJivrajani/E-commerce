'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  RotateCcw,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  MessageSquare
} from 'lucide-react';

interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  details?: string;
  status: 'Requested' | 'Approved' | 'Rejected' | 'Refunded';
  resolution?: string;
  adminComments?: string;
  createdAt: string;
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  
  const [newStatus, setNewStatus] = useState('');
  const [adminComments, setAdminComments] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReturns = async () => {
    try {
      const res = await fetch('/api/returns');
      if (res.ok) {
        const data = await res.json();
        setReturns(data.returns);
      } else {
        toast.error('Failed to load return requests');
      }
    } catch (e) {
      toast.error('Error fetching returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleOpenDetails = (req: ReturnRequest) => {
    setSelectedReturn(req);
    setNewStatus(req.status);
    setAdminComments(req.adminComments || '');
    setModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/returns/${selectedReturn.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminComments
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Return request updated to ${newStatus}`);
        setSelectedReturn(data.returnRequest);
        fetchReturns();
        setModalOpen(false);
      } else {
        toast.error('Failed to update return request');
      }
    } catch (err) {
      toast.error('Network request failed');
    } finally {
      setUpdating(false);
    }
  };

  const filteredReturns = returns.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.orderNumber.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerEmail.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Requested':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Approved':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Refunded':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (loading && returns.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-400">Loading returns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2">
            Return Management <RotateCcw className="h-6 w-6 text-slate-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Process customer returns, exchanges, and refunds.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 max-w-md bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search order #, customer name, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none dark:text-white text-slate-900"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-950 font-semibold border-b border-slate-200 dark:border-slate-800 text-slate-400">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer Info</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Date</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredReturns.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{r.orderNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-900 dark:text-white font-medium block">{r.customerName}</span>
                    <span className="text-xs text-slate-400 block">{r.customerEmail}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-900 dark:text-slate-300 block text-xs font-semibold">{r.reason}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenDetails(r)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-400 bg-slate-500/10 px-2.5 py-1.5 rounded-lg"
                    >
                      <Eye className="h-3.5 w-3.5" /> Review
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReturns.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">No return requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Review Return Request</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <span className="text-xs text-slate-400 block">Order Number</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedReturn.orderNumber}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Customer</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedReturn.customerName} ({selectedReturn.customerEmail})</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Reason for Return</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedReturn.reason}</span>
                {selectedReturn.details && <p className="text-xs text-slate-500 mt-1">{selectedReturn.details}</p>}
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Action / Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="Requested">Pending Review</option>
                  <option value="Approved">Approve Return</option>
                  <option value="Rejected">Reject Return</option>
                  <option value="Refunded">Mark Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Admin Comments (Internal)</label>
                <textarea
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  placeholder="Notes for the team..."
                />
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
                  disabled={updating}
                  className="flex items-center gap-2 rounded-xl bg-slate-600 px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Decision
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
