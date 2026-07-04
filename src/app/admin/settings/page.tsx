'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Settings,
  Save,
  Globe,
  IndianRupee,
  Truck,
  CreditCard,
  Plus,
  Trash2,
  Loader2,
  Building,
  Info
} from 'lucide-react';

interface ShippingZone {
  zoneName: string;
  regions: string[];
  charge: number;
  freeShippingMin: number;
  deliveryDays: number;
}

interface StoreSettings {
  storeName: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  currency: string;
  currencySymbol: string;
  taxRateDefault: number;
  shippingZones: ShippingZone[];
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  whatsappNumber?: string;
  gstDetails?: string;
  maintenanceMode?: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState('');
  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [address, setAddress] = useState('');
  
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');

  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [taxRateDefault, setTaxRateDefault] = useState('18');
  const [gstDetails, setGstDetails] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');

  // Shipping zones list
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  
  // New shipping zone inputs
  const [newZoneName, setNewZoneName] = useState('');
  const [newRegions, setNewRegions] = useState('');
  const [newCharge, setNewCharge] = useState('0');
  const [newFreeShippingMin, setNewFreeShippingMin] = useState('999');
  const [newDeliveryDays, setNewDeliveryDays] = useState('3');

  // Load Settings
  const getSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        const s: StoreSettings = data.settings;

        setStoreName(s.storeName);
        setLogo(s.logo);
        setFavicon(s.favicon);
        setContactEmail(s.contactEmail);
        setContactPhone(s.contactPhone);
        setWhatsappNumber(s.whatsappNumber || '');
        setAddress(s.address);
        
        setFacebook(s.socialLinks?.facebook || '');
        setInstagram(s.socialLinks?.instagram || '');
        setTwitter(s.socialLinks?.twitter || '');

        setCurrency(s.currency);
        setCurrencySymbol(s.currencySymbol);
        setTaxRateDefault(s.taxRateDefault.toString());
        setGstDetails(s.gstDetails || '');
        setMaintenanceMode(s.maintenanceMode || false);

        setRazorpayKeyId(s.razorpayKeyId || '');
        setRazorpayKeySecret(s.razorpayKeySecret || '');

        setShippingZones(s.shippingZones || []);
      }
    } catch (e) {
      toast.error('Failed to load store settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSettings();
  }, []);

  // Add shipping zone to local state
  const handleAddZone = () => {
    if (!newZoneName || !newRegions) {
      toast.error('Zone Name and Regions are required');
      return;
    }

    const regionsList = newRegions.split(',').map(r => r.trim()).filter(r => r);
    const newZone: ShippingZone = {
      zoneName: newZoneName,
      regions: regionsList,
      charge: Number(newCharge) || 0,
      freeShippingMin: Number(newFreeShippingMin) || 0,
      deliveryDays: Number(newDeliveryDays) || 3,
    };

    setShippingZones([...shippingZones, newZone]);
    setNewZoneName('');
    setNewRegions('');
    setNewCharge('0');
    setNewFreeShippingMin('999');
    setNewDeliveryDays('3');
    toast.success('Shipping zone added to registry!');
  };

  // Remove shipping zone
  const handleRemoveZone = (index: number) => {
    setShippingZones(shippingZones.filter((_, i) => i !== index));
  };

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: StoreSettings = {
      storeName,
      logo,
      favicon,
      contactEmail,
      contactPhone,
      whatsappNumber,
      address,
      socialLinks: {
        facebook,
        instagram,
        twitter,
      },
      currency,
      currencySymbol,
      taxRateDefault: Number(taxRateDefault) || 0,
      gstDetails,
      maintenanceMode,
      shippingZones,
      razorpayKeyId,
      razorpayKeySecret,
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Global settings updated successfully!');
        getSettings();
      } else {
        toast.error(data.message || 'Error saving settings');
      }
    } catch (err) {
      toast.error('Settings request failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 glass-panel p-8 rounded-2xl border border-white/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground/80">Loading settings registers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2 text-glow">
            System Configuration Settings <Settings className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-sm text-muted-foreground/80">
            Manage store brand assets, taxes, currencies, payment credentials, and shipping zone thresholds.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-sm">
        
        {/* SECTION 1: BRAND IDENTITY */}
        <div className="rounded-2xl border border-white/10 glass-panel p-6 shadow-sm space-y-4">
          <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider block border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Building className="h-4 w-4 text-primary" /> 1. Brand Identity & Contacts
          </span>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Rush Closet"
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Logo Image URL</label>
              <input
                type="text"
                required
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://..."
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Favicon Icon URL</label>
              <input
                type="text"
                required
                value={favicon}
                onChange={(e) => setFavicon(e.target.value)}
                placeholder="https://..."
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Contact Support Email</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="support@rushcloset.com"
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Support Helpline Phone</label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91..."
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">WhatsApp Number</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+91..."
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Corporate Head Office Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="501 Titanium Square, Ahmedabad, Gujarat, India"
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors"
              />
            </div>

            {/* Social handles */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Facebook Handle</label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Instagram Handle</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Twitter Handle</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://twitter.com/..."
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CURRENCY & TAXES */}
        <div className="rounded-2xl border border-white/10 glass-panel p-6 shadow-sm space-y-4">
          <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider block border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-primary" /> 2. Currency & Defaults
          </span>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Base Currency</label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="INR"
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Currency Symbol</label>
              <input
                type="text"
                required
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="₹"
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-primary transition-colors font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Default Global Tax Rate (GST %)</label>
              <input
                type="number"
                required
                value={taxRateDefault}
                onChange={(e) => setTaxRateDefault(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Registered GST Details</label>
              <input
                type="text"
                value={gstDetails}
                onChange={(e) => setGstDetails(e.target.value)}
                placeholder="22AAAAA0000A1Z5"
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors font-mono"
              />
            </div>

            <div className="sm:col-span-3 mt-2">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="h-5 w-5 rounded border-primary/50 text-primary focus:ring-rose-500/50 bg-card/5"
                />
                <div>
                  <span className="block text-sm font-bold text-primary">Maintenance Mode</span>
                  <span className="block text-xs text-primary/70">Enable to temporarily disable customer storefront access (Admin remains accessible).</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 3: SHIPPING ZONES MATRIX */}
        <div className="rounded-2xl border border-white/10 glass-panel p-6 shadow-sm space-y-4">
          <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider block border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-primary" /> 3. Regional Shipping Zones Matrix
          </span>

          {/* Add zone miniform */}
          <div className="rounded-xl border border-white/10 bg-card/5 p-4 space-y-3">
            <span className="text-xs font-bold text-muted-foreground/80 block border-b border-white/10 pb-2">Add Regional Shipping Rule:</span>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground/80 uppercase">Zone Location Name</label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. West Zone Local"
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-card/5 py-2 px-2.5 focus:outline-none focus:border-primary text-white transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-muted-foreground/80 uppercase">Regions Included (comma separated)</label>
                <input
                  type="text"
                  value={newRegions}
                  onChange={(e) => setNewRegions(e.target.value)}
                  placeholder="e.g. Gujarat, Maharashtra"
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-card/5 py-2 px-2.5 focus:outline-none focus:border-primary text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground/80 uppercase">Delivery Charge (₹)</label>
                <input
                  type="number"
                  value={newCharge}
                  onChange={(e) => setNewCharge(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-card/5 py-2 px-2.5 focus:outline-none focus:border-primary text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground/80 uppercase">Free Shipping Min Cart (₹)</label>
                <input
                  type="number"
                  value={newFreeShippingMin}
                  onChange={(e) => setNewFreeShippingMin(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-card/5 py-2 px-2.5 focus:outline-none focus:border-primary text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground/80 uppercase">Est. Delivery Days</label>
                <input
                  type="number"
                  value={newDeliveryDays}
                  onChange={(e) => setNewDeliveryDays(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-card/5 py-2 px-2.5 focus:outline-none focus:border-primary text-white transition-colors"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddZone}
              className="flex items-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-foreground shadow hover:bg-primary transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Save Shipping Zone
            </button>
          </div>

          {/* Active zones list */}
          {shippingZones.length > 0 && (
            <div className="grid grid-cols-1 gap-2 border border-white/10 rounded-xl p-3 bg-card/5">
              <span className="text-xs font-bold text-muted-foreground/80">Active Shipping Matrices:</span>
              {shippingZones.map((zone, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-card/5 border border-white/10 text-xs text-white">
                  <div>
                    <span className="font-bold text-white block">{zone.zoneName} ({zone.deliveryDays} days)</span>
                    <span className="text-muted-foreground/80 mt-1 block">Regions: {zone.regions.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>Charge: <span className="font-bold">₹{zone.charge}</span></div>
                    <div>Free Shipping threshold: <span className="font-bold text-primary">₹{zone.freeShippingMin}</span></div>
                    <button type="button" onClick={() => handleRemoveZone(idx)} className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: PAYMENT MOCK CREDENTIALS */}
        <div className="rounded-2xl border border-white/10 glass-panel p-6 shadow-sm space-y-4">
          <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider block border-b border-white/10 pb-2 flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-primary" /> 4. Razorpay Payments API Setup
          </span>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Razorpay Mock Key ID</label>
              <input
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                placeholder="rzp_test_..."
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground/80 uppercase">Razorpay Mock Secret Key</label>
              <input
                type="password"
                value={razorpayKeySecret}
                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1 block w-full rounded-xl border border-white/10 bg-card/5 py-2.5 px-3 focus:outline-none focus:border-primary text-white transition-colors font-mono"
              />
            </div>

            {/* Informational Warning */}
            <div className="sm:col-span-2 rounded-xl border border-primary/20 bg-primary/10 p-3 text-xs text-primary/80 flex gap-2">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <span>Make sure to use test key credentials for staging testing validation sandbox integrations. Sandbox checkouts mock orders directly.</span>
            </div>
          </div>
        </div>

        {/* Form save button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-foreground shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:bg-primary transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Global Store Configuration
          </button>
        </div>

      </form>

    </div>
  );
}
