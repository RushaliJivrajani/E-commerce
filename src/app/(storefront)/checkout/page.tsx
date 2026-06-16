'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Truck,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Loader2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [customerSession, setCustomerSession] = useState<any>(null);

  // Address Inputs
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  // Settings
  const [settings, setSettings] = useState<any>(null);

  // Payment choice: 'COD' | 'Razorpay'
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Razorpay'>('COD');

  // Razorpay Gateway Simulation Modal
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);

  useEffect(() => {
    async function loadInit() {
      try {
        // Check customer login first
        const meRes = await fetch('/api/customer/me');
        if (!meRes.ok) {
          // Not logged in — redirect to login with callbackUrl
          toast.error('Please login to continue to checkout');
          router.replace('/account/login?callbackUrl=/checkout');
          return;
        }
        const meData = await meRes.json();
        const cust = meData.customer;
        setCustomerSession(cust);

        const res = await fetch('/api/storefront/init');
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        }

        const cartStr = localStorage.getItem('rf_cart');
        const couponStr = localStorage.getItem('rf_coupon');

        if (!cartStr || JSON.parse(cartStr).length === 0) {
          toast.error('Your cart bag is empty!');
          router.push('/cart');
          return;
        }

        setCart(JSON.parse(cartStr));
        if (couponStr) {
          setCoupon(JSON.parse(couponStr));
        }

        // Pre-fill address from customer profile
        if (cust) {
          setShippingAddress(prev => ({
            ...prev,
            name: cust.name || '',
            email: cust.email || '',
            phone: cust.phone || '',
            ...(cust.addressList?.[0] ? {
              addressLine: cust.addressList[0].addressLine || '',
              city: cust.addressList[0].city || '',
              state: cust.addressList[0].state || '',
              zipCode: cust.addressList[0].zipCode || '',
            } : {}),
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInit();
  }, [router]);

  // Billing math
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = settings?.taxRateDefault || 18;
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  
  const getShippingCharges = () => {
    if (subtotal >= 1499) return 0;
    return 100;
  };
  const shippingCharges = getShippingCharges();
  const discountAmount = coupon ? coupon.discount : 0;
  const totalAmount = subtotal + taxAmount + shippingCharges - discountAmount;

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  // Trigger Checkout Submission
  const submitCheckoutOrder = async (payMethod: 'COD' | 'Razorpay', payStatus: 'Paid' | 'Pending', transactionId?: string) => {
    setPlacingOrder(true);
    const orderLoader = toast.loading('Fulfilling your transaction...');

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: shippingAddress.name,
          customerEmail: shippingAddress.email,
          shippingAddress: {
            addressLine: shippingAddress.addressLine,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
            country: shippingAddress.country,
            phone: shippingAddress.phone
          },
          paymentMethod: payMethod,
          paymentStatus: payStatus,
          paymentDetails: transactionId ? { transactionId, paymentId: transactionId } : {},
          products: cart,
          couponCode: coupon ? coupon.code : null,
          shippingCharges,
          taxAmount,
          discountAmount,
          totalAmount
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Clear cart local storage
        localStorage.removeItem('rf_cart');
        localStorage.removeItem('rf_coupon');
        window.dispatchEvent(new Event('rf-cart-changed'));

        toast.success('Order placed successfully!', { id: orderLoader });
        
        // Redirect to success page
        router.push(`/order-success?orderId=${data.orderId}`);
      } else {
        toast.error(data.message || 'Failed to place order', { id: orderLoader });
        setPlacingOrder(false);
      }
    } catch (err) {
      toast.error('Error submitting order', { id: orderLoader });
      setPlacingOrder(false);
    }
  };

  // Place order wrapper
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!shippingAddress.name || !shippingAddress.email || !shippingAddress.phone || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast.error('Please fill in all shipping details!');
      return;
    }

    if (paymentMethod === 'Razorpay') {
      // Trigger Razorpay Simulation Modal
      setRazorpayModalOpen(true);
    } else {
      // Direct Cash on Delivery placement
      submitCheckoutOrder('COD', 'Pending');
    }
  };

  // Simulate Razorpay Gateway payment flow
  const runRazorpayPaymentSimulation = (outcome: 'SUCCESS' | 'FAIL') => {
    setSimulatingPayment(true);
    setTimeout(() => {
      setSimulatingPayment(false);
      setRazorpayModalOpen(false);

      if (outcome === 'SUCCESS') {
        const mockTransactionId = `pay_sim_${Math.random().toString(36).substr(2, 9)}`;
        toast.success('Payment simulation successful!');
        submitCheckoutOrder('Razorpay', 'Paid', mockTransactionId);
      } else {
        toast.error('Payment simulation failed or was cancelled by user.');
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-400">Loading checkout summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Path Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Link href="/" className="hover:text-slate-500">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-350 dark:text-slate-800" />
        <Link href="/cart" className="hover:text-slate-500">Cart</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-350 dark:text-slate-800" />
        <span className="text-slate-600 dark:text-slate-400 font-bold">Secure Checkout</span>
      </div>

      <h1 className="text-2xl font-black uppercase tracking-tight">SECURE CHECKOUT</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Shipping entries & Payment selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shipping Form Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="h-4.5 w-4.5 text-slate-500" /> Shipping Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Aditya Patel"
                  value={shippingAddress.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 focus:border-slate-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. customer@example.com"
                  value={shippingAddress.email}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 focus:border-slate-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Contact Phone</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 focus:border-slate-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Address Line</label>
                <input
                  type="text"
                  name="addressLine"
                  required
                  placeholder="Street details, apartment number"
                  value={shippingAddress.addressLine}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 focus:border-slate-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Ahmedabad"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 focus:border-slate-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">State / Region</label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="e.g. Gujarat"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 focus:border-slate-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">ZIP / Postal Code</label>
                <input
                  type="text"
                  name="zipCode"
                  required
                  placeholder="e.g. 380054"
                  value={shippingAddress.zipCode}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 focus:border-slate-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Country</label>
                <input
                  type="text"
                  name="country"
                  disabled
                  value={shippingAddress.country}
                  className="w-full rounded-xl border border-slate-250 bg-slate-50 p-3 dark:border-slate-850 dark:bg-slate-950 opacity-80"
                />
              </div>
            </div>
          </div>

          {/* Payment selector card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-slate-500" /> Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              
              {/* Cash On Delivery */}
              <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'COD'
                  ? 'border-slate-600 bg-slate-50/20 dark:bg-slate-950/10'
                  : 'border-slate-200 dark:border-slate-850 hover:border-slate-350'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-slate-600 h-4 w-4"
                  />
                  <div>
                    <p className="text-slate-900 dark:text-white">Cash On Delivery</p>
                    <p className="text-[10px] font-medium text-slate-500">Pay when order reaches your door</p>
                  </div>
                </div>
                <DollarSign className="h-5 w-5 text-slate-500" />
              </label>

              {/* Razorpay Gateway */}
              <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'Razorpay'
                  ? 'border-slate-600 bg-slate-50/20 dark:bg-slate-950/10'
                  : 'border-slate-200 dark:border-slate-850 hover:border-slate-350'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="accent-slate-600 h-4 w-4"
                  />
                  <div>
                    <p className="text-slate-900 dark:text-white">Simulated Razorpay</p>
                    <p className="text-[10px] font-medium text-slate-500">Pay securely online (Simulation)</p>
                  </div>
                </div>
                <CreditCard className="h-5 w-5 text-slate-500" />
              </label>

            </div>
          </div>

        </div>

        {/* Right: Checkout Sidebar details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Order Details</h2>

          {/* Cart items listing */}
          <div className="max-h-56 overflow-y-auto space-y-3 pr-1 border-b border-slate-200 dark:border-slate-800 pb-4">
            {cart.map((item) => (
              <div key={item.sku} className="flex gap-3 text-xs">
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                  <p className="text-[9px] text-slate-500 font-medium">{item.variantInfo || 'Default Variant'}</p>
                  <p className="text-[9px] text-slate-400">Qty: {item.quantity}</p>
                </div>
                <span className="font-black text-slate-900 dark:text-white shrink-0">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Summary pricing calculations */}
          <div className="space-y-2.5 text-xs font-semibold border-b border-slate-200 dark:border-slate-850 pb-4">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Taxes ({taxRate}%)</span>
              <span>₹{taxAmount}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Shipping Fees</span>
              {shippingCharges === 0 ? (
                <span className="text-emerald-500 text-[10px] font-bold uppercase">Free</span>
              ) : (
                <span>₹{shippingCharges}</span>
              )}
            </div>
            {coupon && (
              <div className="flex justify-between text-slate-500 font-bold">
                <span>Discount ({coupon.code})</span>
                <span>- ₹{discountAmount}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white">
            <span>Total Payable</span>
            <span className="text-lg text-slate-600 dark:text-slate-400">₹{totalAmount}</span>
          </div>

          {/* Place Order CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={placingOrder}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-600 hover:bg-slate-500 text-white text-xs font-extrabold uppercase tracking-widest shadow-lg shadow-slate-600/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              {placingOrder ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            <span>Simulated checkout connection secured with SSL mock tags.</span>
          </div>

        </div>

      </form>

      {/* --- RAZORPAY GATEWAY SIMULATOR MODAL --- */}
      {razorpayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-500/30 p-6 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Modal branding strip */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                  R
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wide">Razorpay Gateway</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sandbox Simulator</p>
                </div>
              </div>
              
              <span className="text-xs font-black text-slate-900 dark:text-white">₹{totalAmount}</span>
            </div>

            {simulatingPayment ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-slate-500" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Verifying Simulated Secure Tokens...</p>
                  <p className="text-[10px] text-slate-500">Do not refresh or click back buttons</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-950/60 p-3 flex gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="leading-relaxed">
                    This is a sandbox billing overlay simulating Razorpay API callback scripts. Click below to verify transactions.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => runRazorpayPaymentSimulation('FAIL')}
                    className="py-2.5 rounded-xl border border-slate-200 hover:border-slate-350 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-white text-center cursor-pointer"
                  >
                    Fail & Decline
                  </button>
                  <button
                    onClick={() => runRazorpayPaymentSimulation('SUCCESS')}
                    className="py-2.5 rounded-xl bg-slate-600 hover:bg-slate-500 text-xs font-bold text-white text-center shadow-lg shadow-slate-600/15 cursor-pointer"
                  >
                    Authorize Success
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}
