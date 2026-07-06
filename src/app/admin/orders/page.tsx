'use client';

import React, { useState, useEffect } from'react';
import toast from'react-hot-toast';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  Calendar,
  IndianRupee,
  Clock,
  Printer,
  XCircle,
  RotateCcw,
  CheckCircle,
  Truck,
  Box,
  ClipboardList,
  AlertTriangle,
  Loader2,
  X,
  FileText
} from'lucide-react';

interface TimelineEvent {
  status: string;
  description: string;
  timestamp: string;
}

interface OrderProduct {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  variantInfo?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentMethod:'Razorpay' |'COD';
  paymentStatus:'Paid' |'Pending' |'Failed' |'Refunded';
  paymentDetails?: {
    transactionId?: string;
    paymentId?: string;
    refundId?: string;
  };
  shippingCharges: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status:'Placed' |'Confirmed' |'Packed' |'Shipped' |'Out For Delivery' |'Delivered' |'Cancelled' |'Returned';
  timeline: TimelineEvent[];
  products: OrderProduct[];
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<string>(''); // empty means'All'

  // Detailed Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Status Update State
  const [newStatus, setNewStatus] = useState('');
  const [updateDetails, setUpdateDetails] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      const url = statusTab ?`/api/orders?status=${statusTab}` :'/api/orders';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (e) {
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusTab]);

  // Open Details Modal
  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setUpdateDetails('');
    setModalOpen(true);
  };

  // Update Status Patch
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method:'PATCH',
        headers: {'Content-Type':'application/json' },
        body: JSON.stringify({
          status: newStatus,
          details: updateDetails || undefined,
          // Auto pay COD order if marked delivered
          paymentStatus: newStatus ==='Delivered' && selectedOrder.paymentMethod ==='COD' ?'Paid' : undefined
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Order status updated to ${newStatus}`);
        setSelectedOrder(data.order);
        setUpdateDetails('');
        fetchOrders();
      } else {
        toast.error('Failed to update order status');
      }
    } catch (err) {
      toast.error('Network request failed');
    } finally {
      setUpdating(false);
    }
  };

  // Quick Action: Cancel Order
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method:'PATCH',
        headers: {'Content-Type':'application/json' },
        body: JSON.stringify({ status:'Cancelled', details:'Order cancelled by Admin panel' }),
      });
      if (res.ok) {
        toast.success('Order cancelled successfully');
        setModalOpen(false);
        fetchOrders();
      } else {
        toast.error('Failed to cancel order');
      }
    } catch (e) {
      toast.error('Cancel request failed');
    }
  };

  // Quick Action: Refund Order
  const handleRefundOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to process a refund for this order?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method:'PATCH',
        headers: {'Content-Type':'application/json' },
        body: JSON.stringify({ paymentStatus:'Refunded', status:'Returned', details:'Processed full refund' }),
      });
      if (res.ok) {
        toast.success('Order status updated and refunded');
        setModalOpen(false);
        fetchOrders();
      } else {
        toast.error('Failed to refund order');
      }
    } catch (e) {
      toast.error('Refund request failed');
    }
  };

  // Quick Action: Mark as Paid
  const handleMarkAsPaid = async (orderId: string) => {
    if (!confirm('Confirm you have received the payment for this COD order?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method:'PATCH',
        headers: {'Content-Type':'application/json' },
        body: JSON.stringify({ paymentStatus:'Paid', details:'Payment marked as received' }),
      });
      if (res.ok) {
        toast.success('Order payment status marked as Paid');
        setSelectedOrder((prev) => prev && prev.id === orderId ? { ...prev, paymentStatus:'Paid' } : prev);
        fetchOrders();
      } else {
        toast.error('Failed to update payment status');
      }
    } catch (e) {
      toast.error('Request failed');
    }
  };

  // Print Invoice (Simulate PDF print using browser print trigger)
  const handlePrint = () => {
    window.print();
  };

  // Search filter
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case'Placed':
        return'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case'Confirmed':
        return'bg-card/500/10 text-muted-foreground border-slate-500/20';
      case'Packed':
        return'bg-primary/10 text-primary border-primary/20';
      case'Shipped':
        return'bg-card/500/10 text-muted-foreground border-slate-500/20';
      case'Out For Delivery':
        return'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case'Delivered':
        return'bg-primary/100/10 text-primary border-primary/30/20';
      case'Cancelled':
        return'bg-primary/10 text-primary border-primary/20';
      case'Returned':
        return'bg-card/500/10 text-muted-foreground border-slate-500/20';
      default:
        return'bg-card/500/10 text-muted-foreground border-slate-500/20';
    }
  };

  const tabsList = [
    { name:'All Orders', value:'' },
    { name:'Placed', value:'Placed' },
    { name:'Confirmed', value:'Confirmed' },
    { name:'Packed', value:'Packed' },
    { name:'Shipped', value:'Shipped' },
    { name:'Delivered', value:'Delivered' },
    { name:'Cancelled', value:'Cancelled' },
  ];

  if (loading && orders.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 glass-panel p-8 rounded-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground/80">Loading order registers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            Fulfillment Orders <FileSpreadsheet className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Fulfill orders, edit delivery timelines, issue invoice slips, and track billing.
          </p>
        </div>
      </div>

      {/* Tabs list print:hidden */}
      <div className="flex flex-wrap gap-1 border-b border-border pb-px print:hidden">
        {tabsList.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setStatusTab(tab.value)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
              statusTab === tab.value
                ?'border-b-2 border-primary text-primary'
                :'text-muted-foreground/80 hover:text-foreground border-b-2 border-transparent'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Filter panel print:hidden */}
      <div className="flex items-center gap-3 max-w-md bg-card/50 border border-border rounded-xl px-3 py-2 mt-6 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-shadow print:hidden">
        <Search className="h-4 w-4 text-muted-foreground/80 shrink-0" />
        <input
          type="text"
          placeholder="Search order #, customer name, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium text-foreground focus:outline-none placeholder-slate-400"
        />
      </div>

      {/* Orders Table Container print:hidden */}
      <div className="glass-panel rounded-2xl overflow-hidden print:hidden mt-4 hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="text-xs font-semibold bg-card/50 border-b border-border text-muted-foreground/80">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer Info</th>
                <th className="px-6 py-4 text-center">Gateway</th>
                <th className="px-6 py-4 text-center">Fulfillment</th>
                <th className="px-6 py-4 text-right">Invoice Sum</th>
                <th className="px-6 py-4 text-center">Date</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-card/50 transition-colors">
                  
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-foreground block">{o.orderNumber}</span>
                    <span className="text-xs text-muted-foreground/80 block mt-0.5">Count: {o.products.reduce((acc, p) => acc + p.quantity, 0)} items</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground block truncate tracking-wide">{o.customerName}</span>
                    <span className="text-xs text-muted-foreground/80 block mt-0.5">{o.customerEmail}</span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-foreground block">{o.paymentMethod}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 border ${
                      o.paymentStatus ==='Paid' ?'bg-primary/100/10 text-primary border-primary/30/20' :'bg-primary/10 text-primary border-primary/20'
                    }`}>{o.paymentStatus}</span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                      o.status ==='Cancelled' ?'bg-primary/10 text-primary border-primary/20' :'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {o.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-bold text-primary tracking-wide">
                    ₹{o.totalAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="px-6 py-4 text-center text-xs font-medium text-muted-foreground/80">
                    {new Date(o.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenDetails(o)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground/50 hover:text-primary transition-colors border border-white/20 rounded-xl px-3 py-1.5 glass-button"
                    >
                      <Eye className="h-4 w-4" /> View
                    </button>
                  </td>

                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No orders logged in this bracket.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PRINT AREA FOR INVOICE --- */}
      {/* Hidden by default on screen, visible during window.print() */}
      {selectedOrder && (
        <div className="hidden print:block bg-card text-black p-8 font-sans min-h-screen text-sm">
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <h1 className="text-2xl font-bold">VIARO</h1>
              <p className="text-xs text-gray-500 mt-1">Enterprise eCommerce Billing System</p>
              <p className="text-xs text-gray-500">Ahmedabad, Gujarat, India</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800">TAX INVOICE</h2>
              <p className="text-xs font-bold mt-1">Invoice: #{selectedOrder.orderNumber}</p>
              <p className="text-xs text-gray-500">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6 border-b pb-6">
            <div>
              <span className="text-xs uppercase font-bold text-gray-400">Billing / Shipping Address:</span>
              <p className="font-bold mt-1">{selectedOrder.customerName}</p>
              <p className="text-xs text-gray-600 mt-0.5">{selectedOrder.shippingAddress.addressLine}</p>
              <p className="text-xs text-gray-600">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zipCode}</p>
              <p className="text-xs text-gray-600">Contact: {selectedOrder.shippingAddress.phone}</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold text-gray-400">Payment Summary:</span>
              <p className="font-bold mt-1">Method: {selectedOrder.paymentMethod}</p>
              <p className="text-xs text-gray-600">Status: {selectedOrder.paymentStatus}</p>
              {selectedOrder.paymentDetails?.transactionId && (
                <p className="text-xs text-gray-600 font-mono">TXN: {selectedOrder.paymentDetails.transactionId}</p>
              )}
            </div>
          </div>

          <table className="w-full text-left mt-6 text-xs border-collapse">
            <thead>
              <tr className="border-b bg-gray-100 font-bold">
                <th className="py-2 px-3">Item Details</th>
                <th className="py-2 px-3">SKU</th>
                <th className="py-2 px-3 text-right">Price</th>
                <th className="py-2 px-3 text-center">Qty</th>
                <th className="py-2 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.products.map((p, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2 px-3 font-semibold">{p.name} <span className="text-[10px] text-gray-500 block">{p.variantInfo}</span></td>
                  <td className="py-2 px-3 font-mono">{p.sku}</td>
                  <td className="py-2 px-3 text-right">₹{p.price.toLocaleString()}</td>
                  <td className="py-2 px-3 text-center">{p.quantity}</td>
                  <td className="py-2 px-3 text-right">₹{(p.price * p.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-6">
            <div className="w-64 space-y-1.5 text-xs text-right text-gray-700">
              <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold text-black">₹{(selectedOrder.totalAmount - selectedOrder.taxAmount - selectedOrder.shippingCharges + selectedOrder.discountAmount).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Shipping Charges:</span><span className="font-semibold text-black">+ ₹{selectedOrder.shippingCharges}</span></div>
              <div className="flex justify-between"><span>Tax (GST):</span><span className="font-semibold text-black">+ ₹{selectedOrder.taxAmount}</span></div>
              <div className="flex justify-between text-primary"><span>Discount Applied:</span><span>- ₹{selectedOrder.discountAmount}</span></div>
              <div className="flex justify-between border-t pt-1.5 text-sm font-bold text-black"><span>Total Invoice Amount:</span><span>₹{selectedOrder.totalAmount.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* --- ORDER DETAILS DRAWER MODAL --- */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
          <div className="fixed inset-0 bg-foreground text-background/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-2xl   max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground/80 hover:bg-card/80"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header branding */}
            <div className="flex flex-wrap items-center justify-between border-b border-border/30  pb-4 mb-6 gap-3">
              <div>
                <span className="inline-block rounded bg-card/500/10 px-2 py-0.5 text-xs font-bold text-muted-foreground">{selectedOrder.orderNumber}</span>
                <h3 className="text-lg font-bold text-foreground  mt-1">Order Fulfillment Details</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 rounded-xl bg-card/80 hover:bg-border   px-3 py-2 text-xs font-bold text-foreground/90  border border-border"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Invoice
                </button>
                {selectedOrder.status !=='Cancelled' && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="flex items-center gap-1 rounded-xl bg-primary/10 hover:bg-primary/25 px-3 py-2 text-xs font-bold text-primary"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Cancel Order
                  </button>
                )}
                {selectedOrder.status ==='Returned' && selectedOrder.paymentStatus !=='Refunded' && (
                  <button
                    onClick={() => handleRefundOrder(selectedOrder.id)}
                    className="flex items-center gap-1 rounded-xl bg-card/500/10 hover:bg-card/500/25 px-3 py-2 text-xs font-bold text-muted-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Approve Refund
                  </button>
                )}
                {selectedOrder.paymentMethod ==='COD' && selectedOrder.paymentStatus ==='Pending' && selectedOrder.status !=='Cancelled' && (
                  <button
                    onClick={() => handleMarkAsPaid(selectedOrder.id)}
                    className="flex items-center gap-1 rounded-xl bg-primary/100/10 hover:bg-primary/100/25 px-3 py-2 text-xs font-bold text-primary"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Mark Paid
                  </button>
                )}
              </div>
            </div>

            {/* Split panels layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
              {/* LEFT & CENTER: CUSTOMER, PRODUCT, SHIPPING CARD */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Customer Address Info */}
                <div className="rounded-xl border border-border  p-4 space-y-3 bg-card/50/50">
                  <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider block border-b border-border/30  pb-1">Customer Delivery Details</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground/80 block">Name</span>
                      <span className="font-semibold text-slate-950">{selectedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground/80 block">Email Address</span>
                      <span className="font-semibold text-slate-950">{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground/80 block">Shipping Address</span>
                      <span className="font-medium text-foreground">
                        {selectedOrder.shippingAddress.addressLine}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zipCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground/80 block">Contact Mobile</span>
                      <span className="font-semibold text-foreground">{selectedOrder.shippingAddress.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Products detail list */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider block border-b border-border/30  pb-1">Product Items list</span>
                  <div className="border border-border  rounded-xl overflow-hidden">
                    {selectedOrder.products.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border-b border-border/30  bg-card  last:border-b-0">
                        <div className="flex items-center gap-3">
                          <img src={item.image} className="h-10 w-10 object-cover rounded-lg bg-card/50" />
                          <div>
                            <span className="font-semibold text-foreground  block">{item.name}</span>
                            <span className="text-xs text-muted-foreground/80">{item.variantInfo} | SKU: <code className="font-mono">{item.sku}</code></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-955  block">₹{(item.price * item.quantity).toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground/80">₹{item.price.toLocaleString()} x {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping slip label printing mock */}
                <div className="rounded-xl border border-dashed border-slate-500/20 bg-card/500/5 p-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-muted-foreground/80 block">Shipping Slip Label Generator</span>
                    <p className="text-muted-foreground/80 mt-0.5">Print label directly for packing slip integration.</p>
                  </div>
                  <button
                    onClick={() => {
                      toast.success('Label print instructions sent to warehouse printer!');
                    }}
                    className="flex items-center gap-1 rounded-lg bg-slate-600 px-3 py-1.5 font-bold text-foreground shadow"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print Slip
                  </button>
                </div>

              </div>

              {/* RIGHT: TRACKING TIMELINE & STATUS SWITCHER */}
              <div className="space-y-6 border-l border-border/30  pl-0 lg:pl-6">
                
                {/* Status updater form */}
                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider block border-b border-border/30  pb-1">Update Status</span>
                  
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Fulfillment Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-border bg-card/50 py-2.5 px-3 focus:outline-none   text-foreground"
                    >
                      <option value="Placed">Order Placed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out For Delivery">Out For Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Tracking remarks</label>
                    <input
                      type="text"
                      value={updateDetails}
                      onChange={(e) => setUpdateDetails(e.target.value)}
                      placeholder="e.g. Handed over to BlueDart BD-88"
                      className="mt-1 block w-full rounded-xl border border-border bg-card/50 py-2.5 px-3 focus:outline-none   text-foreground"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="flex w-full justify-center items-center gap-2 rounded-xl bg-slate-600 py-2.5 text-xs font-bold text-foreground"
                  >
                    {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                    Update Status Slip
                  </button>
                </form>

                {/* Delivery tracking Timeline */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider block border-b border-border/30  pb-1">Tracking Timeline</span>
                  <div className="relative pl-4 border-l border-border  space-y-4 text-xs">
                    {selectedOrder.timeline.map((event, idx) => (
                      <div key={idx} className="relative">
                        {/* Timeline Circle Bullet */}
                        <div className="absolute top-0.5 -left-[21px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-border border-2 border-white" />
                        <span className="font-bold text-foreground">{event.status}</span>
                        <p className="text-muted-foreground/80 mt-0.5">{event.description}</p>
                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">
                          {new Date(event.timestamp).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
