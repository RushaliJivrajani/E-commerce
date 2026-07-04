'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  RotateCcw,
  MapPin,
  LogOut,
  User,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  Placed:           { color: 'text-indigo-400',  bg: 'bg-indigo-400/10 border-indigo-400/20',  icon: <Clock className="h-3.5 w-3.5" />,       label: 'Order Placed' },
  Confirmed:        { color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-400/20',       icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Confirmed' },
  Packed:           { color: 'text-purple-400',   bg: 'bg-purple-400/10 border-purple-400/20',     icon: <Package className="h-3.5 w-3.5" />,      label: 'Packed' },
  Shipped:          { color: 'text-cyan-400',  bg: 'bg-cyan-400/10 border-cyan-400/20',   icon: <Truck className="h-3.5 w-3.5" />,        label: 'Shipped' },
  'Out For Delivery':{ color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20',   icon: <Truck className="h-3.5 w-3.5" />,        label: 'Out For Delivery' },
  Delivered:        { color: 'text-teal-400',   bg: 'bg-teal-400/10 border-teal-400/20',     icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Delivered' },
  Cancelled:        { color: 'text-rose-400',     bg: 'bg-rose-400/10 border-rose-400/20',         icon: <XCircle className="h-3.5 w-3.5" />,      label: 'Cancelled' },
  Returned:         { color: 'text-muted-foreground/80',   bg: 'bg-card/10 border-white/20',     icon: <RotateCcw className="h-3.5 w-3.5" />,    label: 'Returned' },
};

const ALL_STATUSES = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { color: 'text-foreground/80', bg: 'bg-card/50 border-border', icon: <Clock className="h-3.5 w-3.5" />, label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${cfg.color} ${cfg.bg}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function OrderTimeline({ timeline, currentStatus }: { timeline: any[]; currentStatus: string }) {
  const currentIdx = ALL_STATUSES.indexOf(currentStatus);
  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-3">Tracking Timeline</p>
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-3 left-3 right-3 h-0.5 bg-card/10 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
            style={{ width: currentIdx < 0 ? '0%' : `${Math.min(((currentIdx) / (ALL_STATUSES.length - 1)) * 100, 100)}%` }}
          />
        </div>

        <div className="flex justify-between relative z-10">
          {ALL_STATUSES.map((st, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={st} className="flex flex-col items-center gap-1 flex-1">
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  done
                    ? 'bg-indigo-400 border-indigo-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                    : 'bg-foreground text-background border-white/20'
                } ${active ? 'scale-110' : ''}`}>
                  {done && <CheckCircle2 className="h-3 w-3 text-foreground" />}
                </div>
                <span className={`text-[9px] font-semibold text-center leading-tight hidden sm:block ${done ? 'text-indigo-400' : 'text-muted-foreground'}`}>
                  {st === 'Out For Delivery' ? 'Out for\nDelivery' : st}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent events */}
      {timeline && timeline.length > 0 && (
        <div className="mt-4 space-y-2">
          {[...timeline].reverse().map((event, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs">
              <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 shadow-sm ${i === 0 ? 'bg-indigo-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'bg-card/20'}`} />
              <div className="flex-1">
                <span className={`font-bold ${i === 0 ? 'text-indigo-400' : 'text-muted-foreground/50'}`}>{event.status}</span>
                <span className="text-muted-foreground mx-1.5">·</span>
                <span className="text-muted-foreground/80">{event.description}</span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">
                  {new Date(event.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onRefresh }: { order: any; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const canCancel = ['Placed', 'Confirmed', 'Packed', 'Shipped'].includes(order.status);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setIsCancelling(true);
      const res = await fetch('/api/customer/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Order cancelled successfully');
        onRefresh();
      } else {
        toast.error(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-indigo-400/30 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-white/10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="font-black text-white text-sm tracking-wider text-glow">{order.orderNumber}</span>
            <StatusBadge status={order.status} />
          </div>
          <span className="text-[11px] text-muted-foreground/80">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground/80">Order Total</p>
            <p className="text-lg font-black text-indigo-400 drop-shadow-md">₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 rounded-xl border border-white/20 bg-card/5 px-3 py-2 text-xs font-bold text-muted-foreground/50 hover:bg-card/10 hover:text-white transition-colors"
          >
            {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Less</> : <><ChevronDown className="h-3.5 w-3.5" /> Details</>}
          </button>
        </div>
      </div>

      {/* Products Preview */}
      <div className="p-5 flex flex-wrap gap-3">
        {order.products?.map((prod: any, i: number) => (
          <div key={i} className="flex items-center gap-3 bg-card/5 rounded-xl p-3 border border-white/10 flex-1 min-w-[240px] hover:bg-card/10 transition-colors">
            {prod.image && (
              <img
                src={prod.image}
                alt={prod.name}
                className="h-14 w-14 rounded-lg object-cover border border-white/10 shrink-0 mix-blend-screen bg-black/40"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{prod.name}</p>
              {prod.variantInfo && (
                <p className="text-[10px] text-muted-foreground/80 mt-0.5">{prod.variantInfo}</p>
              )}
              <p className="text-xs font-bold text-indigo-400 mt-1">₹{prod.price?.toLocaleString('en-IN')} × {prod.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5">
          {/* Timeline */}
          <OrderTimeline timeline={order.timeline} currentStatus={order.status} />

          {/* Address */}
          <div className="mt-4 rounded-xl border border-white/10 bg-card/5 p-4">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Delivery Address
            </p>
            <div className="text-xs text-muted-foreground/50 space-y-0.5">
              <p className="font-semibold text-white">{order.customerName}</p>
              <p>{order.shippingAddress?.addressLine}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.zipCode}</p>
              <p>{order.shippingAddress?.country}</p>
              <p className="text-muted-foreground/80">{order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mt-4 rounded-xl border border-white/10 p-4 space-y-2 text-xs bg-card/5">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">Price Breakdown</p>
            <div className="flex justify-between text-muted-foreground/50">
              <span>Subtotal</span>
              <span>₹{(order.totalAmount + order.discountAmount - order.shippingCharges - order.taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-teal-400 font-bold bg-teal-400/10 p-1 px-2 rounded-lg -mx-2">
                <span>Coupon Discount</span>
                <span>- ₹{order.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground/50">
              <span>Shipping</span>
              <span>{order.shippingCharges === 0 ? <span className="text-teal-400 font-bold uppercase tracking-widest text-[10px]">Free</span> : `₹${order.shippingCharges}`}</span>
            </div>
            <div className="flex justify-between text-muted-foreground/50">
              <span>GST / Tax</span>
              <span>₹{order.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-black text-white border-t border-white/10 pt-2 mt-2">
              <span>Total Paid</span>
              <span className="text-indigo-400 text-sm">₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {canCancel && (
              <div className="pt-4 flex justify-end border-t border-white/10 mt-4">
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white disabled:opacity-50 transition-colors"
                >
                  {isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const ordersRes = await fetch('/api/customer/orders');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/customer/me');
        if (!meRes.ok) {
          // Not logged in — redirect to login
          router.replace('/account/login?callbackUrl=/account/orders');
          return;
        }
        const meData = await meRes.json();
        setCustomer(meData.customer);

        await fetchOrders();
      } catch {
        router.replace('/account/login?callbackUrl=/account/orders');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/customer/logout', { method: 'POST' });
    toast.success('Logged out successfully');
    setTimeout(() => {
      window.location.href = '/';
    }, 600);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'rgba(15, 23, 42, 0.9)',
          color: '#fff',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />

      {/* Page Header */}
      <div className="glass-panel border-b border-white/10 shadow-sm relative z-10">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/" className="flex items-center gap-1 text-xs text-indigo-400/80 hover:text-indigo-400 mb-2 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Shop
            </Link>
            <h1 className="text-2xl font-black text-white uppercase tracking-[0.1em] text-glow">My Orders</h1>
            <p className="text-sm text-muted-foreground/80 mt-0.5">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
            </p>
          </div>

          {customer && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 bg-card/5 border border-white/10 rounded-xl px-4 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-400 text-foreground text-sm font-bold shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                  {customer.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white tracking-wide">{customer.name}</p>
                  <p className="text-muted-foreground/80">{customer.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/50 px-3 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 relative z-10">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 glass-panel border border-white/10 rounded-3xl mt-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-card/5 border border-white/10 mb-5 shadow-lg">
              <ShoppingBag className="h-10 w-10 text-indigo-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-2 text-glow">No orders yet!</h2>
            <p className="text-sm text-muted-foreground/80 mb-6 max-w-xs">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-400 px-6 py-3 text-sm font-bold text-foreground shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:bg-indigo-300 transition-all uppercase tracking-widest"
            >
              <ShoppingBag className="h-4 w-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onRefresh={fetchOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
