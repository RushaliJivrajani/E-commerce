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
import FadeIn from '@/components/FadeIn';

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
        const meRes = await fetch('/api/customer/me', { 
          cache: 'no-store',
          credentials: 'same-origin' 
        });
        if (!meRes.ok) {
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
        localStorage.removeItem('rf_cart');
        localStorage.removeItem('rf_coupon');
        window.dispatchEvent(new Event('rf-cart-changed'));

        toast.success('Order placed successfully!', { id: orderLoader });
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

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress.name || !shippingAddress.email || !shippingAddress.phone || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast.error('Please fill in all shipping details!');
      return;
    }

    if (paymentMethod === 'Razorpay') {
      setRazorpayModalOpen(true);
    } else {
      submitCheckoutOrder('COD', 'Pending');
    }
  };

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={1} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-screen">
      
      <FadeIn direction="up">
        <div className="flex justify-center items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/cart" className="hover:text-primary transition-colors">Bag</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Checkout</span>
        </div>
      </FadeIn>

      <FadeIn direction="up" delay={0.1}>
        <div className="text-center pb-8 border-b border-border/60">
          <h1 className="text-3xl font-extrabold uppercase tracking-[0.2em] text-foreground">Checkout</h1>
        </div>
      </FadeIn>

      <FadeIn direction="up" delay={0.2}>
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left: Shipping entries & Payment selection */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Shipping Form */}
            <div className="space-y-8 bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-2 border-b border-border/30 pb-4">
                <Truck className="h-4 w-4 text-primary" strokeWidth={1.5} /> Shipping Address
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 text-xs">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Aditya Patel"
                    value={shippingAddress.name}
                    onChange={handleInputChange}
                    className="w-full border-b border-border/80 bg-transparent py-3 focus:border-primary focus:outline-none transition-colors rounded-none placeholder-slate-400 text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="customer@example.com"
                    value={shippingAddress.email}
                    onChange={handleInputChange}
                    className="w-full border-b border-border/80 bg-transparent py-3 focus:border-primary focus:outline-none transition-colors rounded-none placeholder-slate-400 text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contact Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="w-full border-b border-border/80 bg-transparent py-3 focus:border-primary focus:outline-none transition-colors rounded-none placeholder-slate-400 text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Address</label>
                  <input
                    type="text"
                    name="addressLine"
                    required
                    placeholder="Street details, apartment"
                    value={shippingAddress.addressLine}
                    onChange={handleInputChange}
                    className="w-full border-b border-border/80 bg-transparent py-3 focus:border-primary focus:outline-none transition-colors rounded-none placeholder-slate-400 text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Ahmedabad"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full border-b border-border/80 bg-transparent py-3 focus:border-primary focus:outline-none transition-colors rounded-none placeholder-slate-400 text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">State / Region</label>
                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="Gujarat"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className="w-full border-b border-border/80 bg-transparent py-3 focus:border-primary focus:outline-none transition-colors rounded-none placeholder-slate-400 text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ZIP / Postal Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    placeholder="380054"
                    value={shippingAddress.zipCode}
                    onChange={handleInputChange}
                    className="w-full border-b border-border/80 bg-transparent py-3 focus:border-primary focus:outline-none transition-colors rounded-none placeholder-slate-400 text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Country</label>
                  <input
                    type="text"
                    name="country"
                    disabled
                    value={shippingAddress.country}
                    className="w-full border-b border-border bg-card/50 py-3 text-muted-foreground/80 cursor-not-allowed rounded-none px-3"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-8 bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-2 border-b border-border/30 pb-4">
                <CreditCard className="h-4 w-4 text-primary" strokeWidth={1.5} /> Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Cash On Delivery */}
                <label className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border bg-card/50 text-foreground/80 hover:border-border/80'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="sr-only"
                  />
                  <DollarSign className={`h-6 w-6 mb-3 ${paymentMethod === 'COD' ? 'text-primary' : 'text-muted-foreground/80'}`} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Cash On Delivery</span>
                </label>

                {/* Razorpay Gateway */}
                <label className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border bg-card/50 text-foreground/80 hover:border-border/80'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="sr-only"
                  />
                  <CreditCard className={`h-6 w-6 mb-3 ${paymentMethod === 'Razorpay' ? 'text-primary' : 'text-muted-foreground/80'}`} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Pay Securely Online</span>
                </label>

              </div>
            </div>

          </div>

          {/* Right: Checkout Sidebar details */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-8">
            <div className="bg-card border border-border p-8 rounded-3xl space-y-8 shadow-sm">
              <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-foreground">Order Summary</h2>

              {/* Cart items listing */}
              <div className="max-h-64 overflow-y-auto space-y-6 pr-2 border-b border-border/30 pb-6 hide-scrollbar">
                {cart.map((item) => (
                  <div key={item.sku} className="flex gap-4 text-xs items-center group">
                    <div className="h-20 w-14 bg-card/50 shrink-0 relative rounded-lg border border-border overflow-hidden transition-colors">
                       <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full z-10 shadow-sm">
                         {item.quantity}
                       </span>
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex-1 overflow-hidden space-y-1">
                      <h4 className="font-semibold text-foreground truncate tracking-wide">{item.name}</h4>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{item.variantInfo || 'Default'}</p>
                    </div>
                    <span className="font-bold text-foreground shrink-0 tracking-wide">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Summary pricing calculations */}
              <div className="space-y-4 text-xs font-medium text-foreground/80 tracking-wide border-b border-border/30 pb-6">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taxes ({taxRate}%)</span>
                  <span className="font-bold text-foreground">₹{taxAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping</span>
                  {shippingCharges === 0 ? (
                    <span className="font-bold text-primary uppercase tracking-widest text-[10px]">Complimentary</span>
                  ) : (
                    <span className="font-bold text-foreground">₹{shippingCharges}</span>
                  )}
                </div>
                {coupon && (
                  <div className="flex justify-between items-center text-primary font-bold bg-primary/10 p-2 rounded-lg border border-primary/30 mt-2">
                    <span>Discount ({coupon.code})</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-sm font-extrabold text-foreground uppercase tracking-widest">
                <span>Total</span>
                <span className="text-xl tracking-wide text-primary">₹{totalAmount}</span>
              </div>

              {/* Place Order CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={placingOrder}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background text-white rounded-xl text-xs font-bold uppercase tracking-[0.15em] shadow-md hover:bg-slate-800 transition-all disabled:opacity-50"
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

              <div className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 pt-2 opacity-80">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                <span>Secure SSL Checkout</span>
              </div>

            </div>
          </div>

        </form>
      </FadeIn>

      {/* --- RAZORPAY GATEWAY SIMULATOR MODAL --- */}
      {razorpayModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground text-background/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-card border border-border p-8 space-y-8 relative rounded-3xl shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                  R
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-widest">Razorpay Sandbox</h3>
                  <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Test Environment</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-foreground tracking-wide">₹{totalAmount}</span>
            </div>

            {simulatingPayment ? (
              <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={1.5} />
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">Processing Payment...</p>
                  <p className="text-[9px] text-muted-foreground font-medium">Please do not refresh</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="border border-primary/30 bg-primary/10 p-4 rounded-xl flex gap-3 text-[10px] text-foreground/90 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
                  <p className="leading-relaxed">
                    This is a sandbox billing overlay. Select an outcome to simulate a payment callback.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => runRazorpayPaymentSimulation('FAIL')}
                    className="flex-1 py-4 border-2 border-border rounded-xl text-[10px] font-bold text-foreground/80 uppercase tracking-widest hover:bg-card/50 transition-all"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => runRazorpayPaymentSimulation('SUCCESS')}
                    className="flex-1 py-4 bg-foreground text-background text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                  >
                    Approve
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
