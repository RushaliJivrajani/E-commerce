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
  Placed:           { color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-200',  icon: <Clock className="h-3.5 w-3.5" />,       label: 'Order Placed' },
  Confirmed:        { color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200',       icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Confirmed' },
  Packed:           { color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',     icon: <Package className="h-3.5 w-3.5" />,      label: 'Packed' },
  Shipped:          { color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-200',   icon: <Truck className="h-3.5 w-3.5" />,        label: 'Shipped' },
  'Out For Delivery':{ color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200',   icon: <Truck className="h-3.5 w-3.5" />,        label: 'Out For Delivery' },
  Delivered:        { color: 'text-green-600',   bg: 'bg-green-50 border-green-200',     icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Delivered' },
  Cancelled:        { color: 'text-red-600',     bg: 'bg-red-50 border-red-200',         icon: <XCircle className="h-3.5 w-3.5" />,      label: 'Cancelled' },
  Returned:         { color: 'text-slate-600',   bg: 'bg-slate-50 border-slate-200',     icon: <RotateCcw className="h-3.5 w-3.5" />,    label: 'Returned' },
};

const ALL_STATUSES = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', icon: <Clock className="h-3.5 w-3.5" />, label: status };
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
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Tracking Timeline</p>
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-3 left-3 right-3 h-0.5 bg-slate-200 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-slate-500 to-slate-500 rounded-full transition-all duration-700"
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
                    ? 'bg-slate-600 border-slate-600 shadow-md shadow-slate-600/20'
                    : 'bg-white border-slate-300'
                } ${active ? 'scale-110' : ''}`}>
                  {done && <CheckCircle2 className="h-3 w-3 text-white" />}
                </div>
                <span className={`text-[9px] font-semibold text-center leading-tight hidden sm:block ${done ? 'text-slate-600' : 'text-slate-400'}`}>
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
              <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${i === 0 ? 'bg-slate-600' : 'bg-slate-300'}`} />
              <div className="flex-1">
                <span className={`font-bold ${i === 0 ? 'text-slate-900' : 'text-slate-600'}`}>{event.status}</span>
                <span className="text-slate-400 mx-1.5">·</span>
                <span className="text-slate-500">{event.description}</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
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
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-900 text-sm tracking-wider">{order.orderNumber}</span>
            <StatusBadge status={order.status} />
          </div>
          <span className="text-[11px] text-slate-400">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400">Order Total</p>
            <p className="text-lg font-black text-slate-600">₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Less</> : <><ChevronDown className="h-3.5 w-3.5" /> Details</>}
          </button>
        </div>
      </div>

      {/* Products Preview */}
      <div className="p-5 flex flex-wrap gap-3">
        {order.products?.map((prod: any, i: number) => (
          <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100 flex-1 min-w-[240px]">
            {prod.image && (
              <img
                src={prod.image}
                alt={prod.name}
                className="h-14 w-14 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
              {prod.variantInfo && (
                <p className="text-[10px] text-slate-400 mt-0.5">{prod.variantInfo}</p>
              )}
              <p className="text-xs font-bold text-slate-600 mt-1">₹{prod.price?.toLocaleString('en-IN')} × {prod.quantity}</p>
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
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Delivery Address
            </p>
            <div className="text-xs text-slate-600 space-y-0.5">
              <p className="font-semibold text-slate-800">{order.customerName}</p>
              <p>{order.shippingAddress?.addressLine}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.zipCode}</p>
              <p>{order.shippingAddress?.country}</p>
              <p className="text-slate-400">{order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mt-4 rounded-xl border border-slate-100 p-4 space-y-2 text-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Price Breakdown</p>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{(order.totalAmount + order.discountAmount - order.shippingCharges - order.taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount</span>
                <span>- ₹{order.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span>{order.shippingCharges === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${order.shippingCharges}`}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST / Tax</span>
              <span>₹{order.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-2">
              <span>Total Paid</span>
              <span className="text-slate-600">₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {canCancel && (
              <div className="pt-4 flex justify-end border-t border-slate-200 mt-4">
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
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
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-500 mb-2 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Shop
            </Link>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">My Orders</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
            </p>
          </div>

          {customer && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-white text-sm font-bold shrink-0">
                  {customer.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">{customer.name}</p>
                  <p className="text-slate-400">{customer.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 border border-slate-100 mb-5">
              <ShoppingBag className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">No orders yet!</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-600/20 hover:bg-slate-500 transition-all"
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
