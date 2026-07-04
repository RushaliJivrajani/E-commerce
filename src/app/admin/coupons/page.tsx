'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Ticket,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Layers,
  ShoppingBag,
  User,
  Loader2,
  X,
  Tag
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'Percentage' | 'Fixed' | 'Free Shipping';
  value: number;
  minAmount: number;
  maxDiscount?: number;
  specificCategory?: string;
  specificProduct?: string;
  specificCustomer?: string;
  usageLimit: number;
  usageCount: number;
  expiryDate: string;
  status: 'Active' | 'Inactive';
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<Coupon['type']>('Percentage');
  const [formValue, setFormValue] = useState('0');
  const [formMinAmount, setFormMinAmount] = useState('0');
  const [formMaxDiscount, setFormMaxDiscount] = useState('');
  const [formSpecificCategory, setFormSpecificCategory] = useState('');
  const [formSpecificProduct, setFormSpecificProduct] = useState('');
  const [formSpecificCustomer, setFormSpecificCustomer] = useState('');
  const [formUsageLimit, setFormUsageLimit] = useState('100');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } catch (e) {
      toast.error('Failed to load active coupons');
    }
  };

  const getCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } catch (e) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCoupons();
  }, []);

  const handleOpenAdd = () => {
    setModalType('add');
    setSelectedCoupon(null);
    setFormCode('');
    setFormType('Percentage');
    setFormValue('10');
    setFormMinAmount('999');
    setFormMaxDiscount('250');
    setFormSpecificCategory('');
    setFormSpecificProduct('');
    setFormSpecificCustomer('');
    setFormUsageLimit('100');
    setFormExpiryDate(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setFormStatus('Active');
    setModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setModalType('edit');
    setSelectedCoupon(coupon);
    setFormCode(coupon.code);
    setFormType(coupon.type);
    setFormValue(coupon.value.toString());
    setFormMinAmount(coupon.minAmount.toString());
    setFormMaxDiscount(coupon.maxDiscount ? coupon.maxDiscount.toString() : '');
    setFormSpecificCategory(coupon.specificCategory || '');
    setFormSpecificProduct(coupon.specificProduct || '');
    setFormSpecificCustomer(coupon.specificCustomer || '');
    setFormUsageLimit(coupon.usageLimit.toString());
    setFormExpiryDate(coupon.expiryDate);
    setFormStatus(coupon.status);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formType || formValue === undefined) {
      toast.error('Code, Type, and Value are required');
      return;
    }

    setSaving(true);
    const payload = {
      code: formCode,
      type: formType,
      value: Number(formValue),
      minAmount: Number(formMinAmount),
      maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : undefined,
      specificCategory: formSpecificCategory || undefined,
      specificProduct: formSpecificProduct || undefined,
      specificCustomer: formSpecificCustomer || undefined,
      usageLimit: Number(formUsageLimit),
      expiryDate: formExpiryDate,
      status: formStatus,
    };

    try {
      const url = modalType === 'add' ? '/api/coupons' : `/api/coupons/${selectedCoupon?.id}`;
      const method = modalType === 'add' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(modalType === 'add' ? 'Coupon generated!' : 'Coupon rules updated!');
        setModalOpen(false);
        getCoupons();
      } else {
        toast.error(data.message || 'Error executing coupon action');
      }
    } catch (err) {
      toast.error('Coupon request failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Coupon deleted successfully');
        getCoupons();
      } else {
        toast.error('Failed to delete coupon');
      }
    } catch (e) {
      toast.error('Delete request failed');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground/80">Loading discount vouchers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-white sm:text-3xl flex items-center gap-2">
            Discount Coupons & Vouchers <Ticket className="h-6 w-6 text-muted-foreground" />
          </h1>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
            Create and moderate promotional codes with specific rules, category locks, and limits.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-slate-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-600/10 hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm dark:border-slate-800 dark:bg-foreground text-background/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground dark:text-muted-foreground/80">
            <thead className="text-xs uppercase bg-card/50 dark:bg-slate-950 font-semibold border-b border-border dark:border-slate-800 text-muted-foreground/80">
              <tr>
                <th className="px-6 py-4">Promo Code</th>
                <th className="px-6 py-4">Discount Type</th>
                <th className="px-6 py-4 text-center">Value</th>
                <th className="px-6 py-4 text-right">Min Amount</th>
                <th className="px-6 py-4 text-center">Usage Limit</th>
                <th className="px-6 py-4 text-center">Expiry</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-card/50/50 dark:hover:bg-slate-950/20">
                  
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-muted-foreground dark:text-muted-foreground/80 text-sm tracking-wider font-mono bg-card/500/10 px-2.5 py-1 rounded-lg">
                      {c.code}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-foreground dark:text-muted-foreground/50 font-medium">
                    {c.type}
                  </td>

                  <td className="px-6 py-4 text-center font-bold text-slate-950 dark:text-white">
                    {c.type === 'Percentage' ? `${c.value}%` : `₹${c.value}`}
                  </td>

                  <td className="px-6 py-4 text-right font-semibold text-slate-950 dark:text-white">
                    ₹{c.minAmount.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="text-foreground/80 dark:text-muted-foreground/50 font-bold">{c.usageCount}</span>
                    <span className="text-muted-foreground/80"> / {c.usageLimit} limit</span>
                  </td>

                  <td className="px-6 py-4 text-center text-xs text-muted-foreground/80">
                    {new Date(c.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        c.status === 'Active'
                          ? 'bg-primary/100/10 text-primary'
                          : 'bg-card/500/10 text-muted-foreground'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenEdit(c)} className="p-1.5 rounded-lg text-muted-foreground/80 hover:text-muted-foreground hover:bg-card/80 dark:hover:bg-slate-850"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-muted-foreground/80 hover:text-rose-500 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>

                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground/80">No discount codes created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl dark:border-slate-800 dark:bg-foreground text-background">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground/80 hover:bg-card/80 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-foreground dark:text-white mb-4">
              {modalType === 'add' ? 'Create Promo Coupon' : 'Edit Promo Coupon'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Promo Code Symbol</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. FESTIVE15"
                    className="mt-1 block w-full rounded-xl border border-border bg-card/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-foreground dark:text-white font-mono font-bold tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Discount Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="mt-1 block w-full rounded-xl border border-border bg-card/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-foreground dark:text-white"
                  >
                    <option value="Percentage">Percentage Discount (%)</option>
                    <option value="Fixed">Fixed Amount Discount (₹)</option>
                    <option value="Free Shipping">Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-border bg-card/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-foreground dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Min Cart Amount (₹)</label>
                  <input
                    type="number"
                    value={formMinAmount}
                    onChange={(e) => setFormMinAmount(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-border bg-card/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-foreground dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Max Discount Limit (₹) (Optional)</label>
                  <input
                    type="number"
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                    placeholder="None"
                    className="mt-1 block w-full rounded-xl border border-border bg-card/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-foreground dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Total Usage Limit</label>
                  <input
                    type="number"
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-border bg-card/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-foreground dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Expiration Date</label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-border bg-card/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-foreground dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Coupon Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="mt-1 block w-full rounded-xl border border-border bg-card/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-foreground dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Constraint Category/Product Lock */}
                <div className="sm:col-span-2 border-t border-border/30 dark:border-slate-800 pt-3">
                  <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider block mb-2 flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> Promotion Target Rules</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Specific Category ID (Optional)</label>
                  <input
                    type="text"
                    value={formSpecificCategory}
                    onChange={(e) => setFormSpecificCategory(e.target.value)}
                    placeholder="None (Applies to all)"
                    className="mt-1 block w-full rounded-xl border border-border bg-card/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-foreground dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Specific Product ID (Optional)</label>
                  <input
                    type="text"
                    value={formSpecificProduct}
                    onChange={(e) => setFormSpecificProduct(e.target.value)}
                    placeholder="None (Applies to all)"
                    className="mt-1 block w-full rounded-xl border border-border bg-card/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-foreground dark:text-white"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-border/30 dark:border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground/90 hover:bg-card/50 dark:border-slate-800 dark:bg-slate-950 dark:text-muted-foreground/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-slate-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modalType === 'add' ? 'Create Coupon' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
