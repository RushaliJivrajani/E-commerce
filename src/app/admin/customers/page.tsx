'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  Eye,
  Ban,
  UserCheck,
  MapPin,
  ShoppingBag,
  Heart,
  IndianRupee,
  FileText,
  Loader2,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Address {
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addressList: Address[];
  totalSpent: number;
  ordersCount: number;
  wishlistCount: number;
  status: 'Active' | 'Blocked';
  notes?: string;
  createdAt: string;
  orders?: any[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Profile State
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formNotes, setFormNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Fetch Customers list
  const fetchCustomers = async () => {
    try {
      const url = searchQuery ? `/api/customers?search=${searchQuery}` : '/api/customers';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers);
      } else {
        toast.error('Failed to load customers');
      }
    } catch (e) {
      toast.error('Error fetching customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  // Open profile details panel
  const handleOpenProfile = async (id: string) => {
    const res = await fetch(`/api/customers/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedCustomer(data.customer);
      setFormNotes(data.customer.notes || '');
      setProfileOpen(true);
    } else {
      toast.error('Failed to load customer profile logs');
    }
  };

  // Toggle user block/unblock status
  const handleToggleBlock = async (customer: Customer) => {
    const nextStatus = customer.status === 'Blocked' ? 'Active' : 'Blocked';
    if (!confirm(`Are you sure you want to change this customer status to ${nextStatus}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Customer account set to ${nextStatus}`);
        if (selectedCustomer && selectedCustomer.id === customer.id) {
          setSelectedCustomer({ ...selectedCustomer, status: nextStatus });
        }
        fetchCustomers();
      } else {
        toast.error(data.message || 'Action restricted by permissions');
      }
    } catch (err) {
      toast.error('Network request failed');
    }
  };

  // Save private notes
  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setSavingNotes(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: formNotes }),
      });

      if (res.ok) {
        toast.success('Private administrative notes updated');
        setSelectedCustomer({ ...selectedCustomer, notes: formNotes });
        fetchCustomers();
      } else {
        toast.error('Failed to save notes');
      }
    } catch (err) {
      toast.error('Error in request');
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 glass-panel p-8 rounded-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">Loading customer roster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
            Customers Directory <Users className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-sm text-muted-foreground">
            View profiles, wishlist stats, order history, write remarks, and manage blocks.
          </p>
        </div>
      </div>

      {/* Directory Filter Bar */}
      <div className="flex items-center gap-3 max-w-md bg-card rounded-xl border border-border/80 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-shadow shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground/80 shrink-0" />
        <input
          type="text"
          placeholder="Search customers by name, email, phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none text-foreground placeholder-slate-400 font-medium"
        />
      </div>

      {/* Customer List Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground/80">
            <thead className="text-xs uppercase bg-card/50 font-semibold border-b border-border text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Contact Phone</th>
                <th className="px-6 py-4 text-center">Orders Count</th>
                <th className="px-6 py-4 text-right">Total Billing Spent</th>
                <th className="px-6 py-4 text-center">Wishlist Items</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <motion.tbody 
              initial="hidden" 
              animate="visible" 
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
              className="divide-y divide-border/20"
            >
              {customers.map((c) => (
                <motion.tr 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  key={c.id} 
                  className="hover:bg-card/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-bold text-foreground block">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.email}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-mono text-foreground/80">
                    {c.phone || 'No Contact Phone'}
                  </td>

                  <td className="px-6 py-4 text-center font-semibold text-foreground/90">
                    {c.ordersCount}
                  </td>

                  <td className="px-6 py-4 text-right font-bold text-primary">
                    ₹{c.totalSpent.toLocaleString('en-IN')}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs text-pink-500 font-semibold">
                      <Heart className="h-3.5 w-3.5 fill-pink-100" /> {c.wishlistCount}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold border ${
                        c.status === 'Active'
                          ? 'border-primary/30 bg-primary/10 text-primary'
                          : 'border-primary bg-primary text-primary'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenProfile(c.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-foreground/80 hover:text-foreground bg-card border border-border px-2 py-1.5 rounded-lg transition-colors hover:bg-card/50 shadow-sm"
                      >
                        <Eye className="h-3.5 w-3.5" /> Profile
                      </button>
                      <button
                        onClick={() => handleToggleBlock(c)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          c.status === 'Blocked'
                            ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/10'
                            : 'border-primary bg-primary text-primary hover:bg-primary'
                        }`}
                        title={c.status === 'Blocked' ? 'Unblock Customer' : 'Block Customer'}
                      >
                        {c.status === 'Blocked' ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">No customers registered under search parameters.</td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* --- PROFILE DETAILS MODAL PANEL --- */}
      <AnimatePresence>
      {profileOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" 
            onClick={() => setProfileOpen(false)} 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto z-10"
          >
            <button
              onClick={() => setProfileOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground/80 hover:text-foreground hover:bg-card/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-border pb-4 mb-6 gap-3">
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedCustomer.name}</h3>
                <span className="text-xs text-muted-foreground block mt-0.5">{selectedCustomer.email} | Joined: {new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => handleToggleBlock(selectedCustomer)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  selectedCustomer.status === 'Blocked'
                    ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/10'
                    : 'border-primary bg-primary text-primary hover:bg-primary'
                }`}
              >
                {selectedCustomer.status === 'Blocked' ? (
                  <>
                    <UserCheck className="h-4 w-4" /> Unblock Account
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4" /> Block Account
                  </>
                )}
              </button>
            </div>

            {/* Panel details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
              
              {/* LEFT COLUMN: CONTACTS & NOTES */}
              <div className="space-y-6">
                
                {/* Contacts Box */}
                <div className="rounded-xl border border-border p-4 space-y-3 bg-card/50">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block border-b border-border pb-1">Particulars</span>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground block">Phone Mobile</span>
                      <span className="font-semibold text-foreground">{selectedCustomer.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Total Spent</span>
                      <span className="font-bold text-primary">₹{selectedCustomer.totalSpent.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Purchase volume</span>
                      <span className="font-semibold text-foreground">{selectedCustomer.ordersCount} orders</span>
                    </div>
                  </div>
                </div>

                {/* Notes box Form */}
                <form onSubmit={handleSaveNotes} className="space-y-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block border-b border-border pb-1">Private Admin Notes</span>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={4}
                    placeholder="Enter private tracking info, customer preferences..."
                    className="w-full text-xs rounded-xl border border-border/80 bg-card p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground transition-colors placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={savingNotes}
                    className="flex items-center gap-1 bg-primary text-white font-bold text-xs px-3 py-2 rounded-xl hover:bg-primary transition-colors shadow-sm disabled:opacity-50"
                  >
                    {savingNotes && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save Notes
                  </button>
                </form>

              </div>

              {/* CENTER & RIGHT COLUMN: ADDRESSES & ORDERS HISTORY */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Address Cards */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block border-b border-border pb-1">Registered Addresses</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCustomer.addressList.map((addr, idx) => (
                      <div key={idx} className="flex gap-3 rounded-xl border border-border p-3 bg-card/50 text-xs hover:bg-card/80 transition-colors">
                        <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-foreground block">Address #{idx + 1}</span>
                          <p className="text-foreground/80 mt-1">{addr.addressLine}</p>
                          <p className="text-foreground/80">{addr.city}, {addr.state} - {addr.zipCode}</p>
                          <p className="text-primary font-semibold">{addr.country}</p>
                        </div>
                      </div>
                    ))}
                    {selectedCustomer.addressList.length === 0 && (
                      <p className="text-xs text-muted-foreground">No shipping addresses listed.</p>
                    )}
                  </div>
                </div>

                {/* Purchase Order History list */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block border-b border-border pb-1">Order Transaction History</span>
                  <div className="border border-border rounded-xl overflow-hidden text-xs bg-card">
                    {selectedCustomer.orders?.map((ord: any) => (
                      <div key={ord.id} className="flex items-center justify-between p-3 border-b border-border hover:bg-card/50 transition-colors last:border-b-0">
                        <div>
                          <span className="font-bold text-foreground block">{ord.orderNumber}</span>
                          <span className="text-muted-foreground">{new Date(ord.createdAt).toLocaleDateString()} | {ord.products.length} products</span>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <span className="font-bold text-primary block">₹{ord.totalAmount.toLocaleString()}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">{ord.paymentStatus}</span>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 font-semibold border ${
                            ord.status === 'Delivered' ? 'border-primary/30 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/10 text-primary'
                          }`}>{ord.status}</span>
                        </div>
                      </div>
                    ))}
                    {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) && (
                      <p className="text-xs text-muted-foreground p-4 text-center">No purchases recorded.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </motion.div>
        </div>
      )}
      </AnimatePresence>

    </div>
  );
}
