'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import FadeIn from '@/components/FadeIn';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductDetailWrapperProps {
  product: any;
  reviews: any[];
  similarProducts: any[];
}

export default function ProductDetailWrapper({ product, reviews, similarProducts }: ProductDetailWrapperProps) {
  const [activeImage, setActiveImage] = useState(
    product.images && product.images[0] ? product.images[0] : 'https://placehold.co/600?text=Product+Image'
  );
  
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});

  // Attributes states
  const [selectedSize, setSelectedSize] = useState(
    product.attributes?.sizes && product.attributes.sizes.length > 0 ? product.attributes.sizes[0] : ''
  );
  const [selectedColor, setSelectedColor] = useState(
    product.attributes?.colors && product.attributes.colors.length > 0 ? product.attributes.colors[0] : ''
  );
  const [selectedFabric, setSelectedFabric] = useState(
    product.attributes?.fabrics && product.attributes.fabrics.length > 0 ? product.attributes.fabrics[0] : ''
  );

  // Active matching variant
  const [activeVariant, setActiveVariant] = useState<any>(null);
  const [activePrice, setActivePrice] = useState(product.sellingPrice);
  const [activeSku, setActiveSku] = useState(product.id);
  const [activeStock, setActiveStock] = useState(product.stock);

  // Review Submitting state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [clientReviews, setClientReviews] = useState<any[]>(reviews);

  // Variant matching rules
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const matched = product.variants.find((v: any) => {
        const matchesSize = !selectedSize || v.size === selectedSize;
        const matchesColor = !selectedColor || v.color === selectedColor;
        const matchesFabric = !selectedFabric || v.fabric === selectedFabric;
        return matchesSize && matchesColor && matchesFabric;
      });

      if (matched) {
        setActiveVariant(matched);
        setActivePrice(matched.price || product.sellingPrice);
        setActiveSku(matched.sku);
        setActiveStock(matched.stock);
      } else {
        setActiveVariant(null);
        setActivePrice(product.sellingPrice);
        setActiveSku(product.id + '-UNAVAILABLE');
        setActiveStock(0);
      }
    } else {
      setActiveVariant(null);
      setActivePrice(product.sellingPrice);
      setActiveSku(product.id);
      setActiveStock(product.stock);
    }
  }, [selectedSize, selectedColor, selectedFabric, product]);

  const handleAddToCart = () => {
    if (activeStock <= 0) {
      toast.error('This variant combination is currently out of stock!');
      return;
    }

    try {
      const cartStr = localStorage.getItem('rf_cart');
      let cart = cartStr ? JSON.parse(cartStr) : [];

      const variantInfoParts = [];
      if (selectedSize) variantInfoParts.push(`Size: ${selectedSize}`);
      if (selectedColor) variantInfoParts.push(`Color: ${selectedColor}`);
      if (selectedFabric) variantInfoParts.push(`Fabric: ${selectedFabric}`);
      const variantInfo = variantInfoParts.join(', ');

      const cartItem = {
        productId: product.id,
        name: product.name,
        sku: activeSku,
        price: activePrice,
        quantity: 1,
        maxStock: activeStock,
        image: product.images && product.images[0] ? product.images[0] : 'https://placehold.co/100',
        variantInfo
      };

      const existingIndex = cart.findIndex((item: any) => item.sku === activeSku);
      if (existingIndex > -1) {
        if (cart[existingIndex].quantity + 1 > activeStock) {
          toast.error(`Cannot add more. Only ${activeStock} items in stock.`);
          return;
        }
        cart[existingIndex].quantity += 1;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem('rf_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('rf-cart-changed'));
      toast.success(`${product.name} added to cart!`);
    } catch (e) {
      toast.error('Failed to add item to cart');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please write some review details');
      return;
    }

    setIsSubmittingReview(true);
    const toastLoader = toast.loading('Posting review...');

    try {
      const res = await fetch('/api/storefront/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          rating: reviewRating,
          comment: reviewComment,
          customerName: 'Verified Storefront Customer'
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Review posted successfully! It will appear after moderation.', { id: toastLoader });
        setReviewComment('');
        
        if (data.review) {
          setClientReviews(prev => [data.review, ...prev]);
        }
      } else {
        toast.error('Failed to post review', { id: toastLoader });
      }
    } catch (err) {
      toast.error('Error posting review feedback', { id: toastLoader });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const hasDiscount = product.regularPrice > activePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.regularPrice - activePrice) / product.regularPrice) * 100)
    : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(2.5)' });
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomStyle({ transformOrigin: 'center', transform: 'scale(1)' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Path Breadcrumbs */}
      <FadeIn direction="up">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 font-medium">
          <Link href="/" className="hover:text-primary hover:underline transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link href="/shop" className="hover:text-primary hover:underline transition-colors">Shop</Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-bold">{product.name}</span>
        </div>
      </FadeIn>

      {/* Main Grid: Images Column + Actions Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left: Product Media Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 h-full">
          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div className="flex md:flex-col gap-4 overflow-x-auto md:w-20 shrink-0 hide-scrollbar py-2 md:py-0">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-[3/4] w-20 bg-card/80 overflow-hidden focus:outline-none transition-all rounded-xl border ${
                    activeImage === img ? 'opacity-100 border-primary ring-2 ring-primary ring-offset-2' : 'opacity-60 hover:opacity-100 border-border'
                  }`}
                >
                  <img src={img} alt="Thumbnail view" className="h-full w-full object-cover mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
          <FadeIn direction="left" className="flex-1 w-full bg-card/50 border border-border rounded-3xl aspect-[3/4] overflow-hidden relative cursor-crosshair shadow-sm">
            <div
              className="h-full w-full relative"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={activeImage}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 ease-out"
                  style={zoomStyle}
                />
              </AnimatePresence>
            </div>
          </FadeIn>
        </div>

        {/* Right: Product details and action panel */}
        <div className="lg:col-span-5 space-y-8 lg:pl-6 pt-4">
          <FadeIn direction="up">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" /> {product.brand}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-widest leading-[1.1] font-headings">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-2 mt-4">
                <div className="flex text-primary">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-primary" />)}
                </div>
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-b border-dashed border-border/80">
                  {clientReviews.length} premium reviews
                </span>
              </div>

              {/* Pricing box */}
              <div className="flex flex-col pt-6 mt-6 border-t border-border/40">
                <div className="flex items-end gap-4">
                  <span className="text-3xl md:text-4xl font-black text-foreground tracking-widest">₹{activePrice.toLocaleString()}</span>
                  {hasDiscount && (
                    <span className="text-lg md:text-xl font-bold text-muted-foreground line-through decoration-primary/50 decoration-2">₹{product.regularPrice.toLocaleString()}</span>
                  )}
                </div>
                {hasDiscount && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground mt-4 bg-primary inline-block w-fit px-3 py-1.5 rounded-full shadow-md shadow-primary/20">
                    Save ₹{(product.regularPrice - activePrice).toLocaleString()} ({discountPercent}%)
                  </span>
                )}
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 flex items-center gap-1.5 font-bold"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Inclusive of all taxes</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <p className="text-sm leading-relaxed text-foreground/70 font-medium max-w-lg">
              {product.shortDescription || product.description.split('.')[0] + '.'}
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            {/* --- VARIANT MATRIX SELECTORS --- */}
            <div className="space-y-8 pt-8 border-t border-border/40">
              {/* Sizes Selector */}
              {product.attributes?.sizes && product.attributes.sizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Size</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground underline underline-offset-4 cursor-pointer hover:text-primary transition-colors">Size Guide</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.attributes.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 min-w-[3.5rem] px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                          selectedSize === size
                            ? 'bg-foreground text-background shadow-lg scale-105'
                            : 'bg-card text-foreground border border-border/60 hover:border-foreground'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors Selector */}
              {product.attributes?.colors && product.attributes.colors.length > 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Select Color</span>
                  <div className="flex flex-wrap gap-3">
                    {product.attributes.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`h-10 px-5 text-xs font-black uppercase tracking-wider rounded-full transition-all flex items-center gap-2 ${
                          selectedColor === color
                            ? 'bg-foreground text-background shadow-md'
                            : 'bg-card text-foreground border border-border/60 hover:border-foreground'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fabrics Selector */}
              {product.attributes?.fabrics && product.attributes.fabrics.length > 0 && (
                <div className="space-y-3">
                  <span className="text-sm font-bold text-foreground/80 block">Fabric: <span className="font-bold text-foreground">{selectedFabric}</span></span>
                  <div className="flex flex-wrap gap-3">
                    {product.attributes.fabrics.map((fab: string) => (
                      <button
                        key={fab}
                        onClick={() => setSelectedFabric(fab)}
                        className={`h-12 px-5 text-sm font-bold rounded-xl border-2 transition-all ${
                          selectedFabric === fab
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border text-foreground/80 hover:bg-card/50 hover:border-border/80'
                        }`}
                      >
                        {fab}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            {/* Action Box */}
            <div className="p-1 mt-10">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-6">
                {activeStock > 0 ? (
                  <span className="text-green-500 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> In Stock & Ready to Ship</span>
                ) : (
                  <span className="text-primary flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Currently Unavailable</span>
                )}
              </div>
              
              <div className="pt-2 flex flex-col gap-4">
                <motion.button
                  whileTap={activeStock > 0 ? { scale: 0.95 } : {}}
                  onClick={handleAddToCart}
                  disabled={activeStock <= 0}
                  className={`w-full py-5 px-6 text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 ${
                    activeStock > 0
                      ? 'bg-foreground text-background hover:bg-primary hover:text-white shadow-xl shadow-black/10'
                      : 'bg-muted text-muted-foreground cursor-not-allowed border border-border/40'
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {activeStock > 0 ? 'Add to Bag' : 'Sold Out'}
                </motion.button>
              </div>

              {/* Secure transaction indicator */}
              <div className="flex items-center justify-start gap-8 text-[10px] text-muted-foreground font-black uppercase tracking-widest pt-8 border-t border-border/40 mt-8">
                <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Free Express Shipping</span>
                <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-primary" /> 14-Day Returns</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Product Long Description */}
      {product.description && (
        <FadeIn direction="up">
          <section className="border-t border-border/60 pt-16 max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-2xl font-extrabold uppercase tracking-[0.2em] text-foreground flex items-center justify-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" /> Details & Craftsmanship <Sparkles className="h-5 w-5 text-primary" />
            </h2>
            <div
              className="text-base leading-loose text-foreground/80 max-w-3xl mx-auto px-4"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        </FadeIn>
      )}

      <hr className="border-border/60 my-16" />

      {/* --- REVIEWS SECTION --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Write a Review */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Curated Reviews</h3>
          <p className="text-sm font-medium text-muted-foreground">Share your experience with the community</p>
          <form onSubmit={handleReviewSubmit} className="space-y-6 bg-card border border-border p-8 rounded-3xl shadow-sm">
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quality Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= reviewRating
                          ? 'text-primary fill-primary drop-shadow-sm'
                          : 'text-border fill-border'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Your Insights</label>
              <textarea
                rows={4}
                placeholder="Detail the fit, fabric, and overall impression..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full text-sm border-2 border-border bg-card/50 p-4 focus:border-primary focus:ring-0 focus:bg-card outline-none rounded-xl resize-none text-foreground placeholder-slate-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-full py-4 bg-foreground text-background rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-opacity uppercase tracking-widest"
            >
              {isSubmittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>

        {/* Reviews Listing */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-bold text-foreground">
            Client Voices ({clientReviews.length})
          </h3>
          
          {clientReviews.length === 0 ? (
            <div className="py-20 border-2 border-dashed border-border rounded-3xl bg-card/50 text-center space-y-4">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" strokeWidth={1} />
              <p className="text-sm font-medium text-muted-foreground tracking-wide">No reviews yet. Be the first to share your aesthetic insights!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {clientReviews.map((rev) => (
                <div key={rev.id} className="border border-border p-8 rounded-3xl bg-card shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center border-b border-border/30 pb-4">
                    <span className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                      <div className="bg-primary/20 p-1.5 rounded-full"><MessageSquare className="h-4 w-4 text-primary" /></div> {rev.customerName}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                      {new Date(rev.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < rev.rating ? 'text-primary fill-primary' : 'text-border fill-border'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-base text-foreground/90 leading-relaxed text-balance">{rev.comment}</p>

                  {/* Merchant Reply if exists */}
                  {rev.reply && (
                    <div className="mt-6 bg-card/50 border-l-4 border-primary p-5 rounded-r-2xl space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-5">
                        <Sparkles className="h-16 w-16 text-primary" />
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest relative z-10">
                        <ShieldCheck className="h-4 w-4" /> Boutique Concierge
                      </div>
                      <p className="text-sm font-medium text-foreground/80 relative z-10 italic">"{rev.reply}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* --- SIMILAR PRODUCTS GRID --- */}
      {similarProducts.length > 0 && (
        <section className="pt-20 space-y-12 mb-10">
          <div className="mb-8 text-center">
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              Recommended Additions
            </h3>
            <p className="text-sm font-medium text-muted-foreground mt-3">Curated selections that complement this piece</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((prod) => {
              const matchesPrice = prod.regularPrice > prod.sellingPrice;
              const matchesPercent = matchesPrice
                ? Math.round(((prod.regularPrice - prod.sellingPrice) / prod.regularPrice) * 100)
                : 0;

              return (
                <Link
                  key={prod.id}
                  href={`/product/${prod.slug}`}
                  className="group flex flex-col transition-all duration-500 bg-card p-2 rounded-3xl shadow-sm hover:shadow-xl border border-border/30"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-card/50 mb-4 rounded-2xl border border-border/30">
                    {matchesPrice && (
                      <span className="absolute top-3 left-3 z-10 bg-primary px-2 py-1 text-[10px] font-bold text-white rounded uppercase tracking-widest shadow-sm">
                        {matchesPercent}% Off
                      </span>
                    )}
                    <img
                      src={prod.images && prod.images[0] ? prod.images[0] : 'https://placehold.co/300'}
                      alt={prod.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex flex-col space-y-2 text-center pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{prod.brand}</span>
                    <h4 className="text-sm font-bold text-foreground line-clamp-1 tracking-wide group-hover:text-primary transition-colors">
                      {prod.name}
                    </h4>

                    <div className="flex items-center justify-center gap-3 pt-1">
                      <span className="text-base font-bold text-foreground tracking-wide">₹{prod.sellingPrice}</span>
                      {matchesPrice && (
                        <span className="text-xs font-medium text-muted-foreground line-through">₹{prod.regularPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
