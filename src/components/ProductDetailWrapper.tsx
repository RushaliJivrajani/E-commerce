'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Tag,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductDetailWrapperProps {
  product: any;
  reviews: any[];
  similarProducts: any[];
}

export default function ProductDetailWrapper({ product, reviews, similarProducts }: ProductDetailWrapperProps) {
  const [activeImage, setActiveImage] = useState(
    product.images && product.images[0] ? product.images[0] : 'https://placehold.co/600?text=Product+Image'
  );

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
      // Find a variant matching selected size, color, fabric
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
        // Fallback or out of stock option combo
        setActiveVariant(null);
        setActivePrice(product.sellingPrice);
        setActiveSku(product.id + '-UNAVAILABLE');
        setActiveStock(0); // This size/color combination is not available
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

      // Compile variant information text
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
        image: product.images && product.images[0] ? product.images[0] : 'https://placehold.co/100',
        variantInfo
      };

      // Check if duplicate item exists in cart
      const existingIndex = cart.findIndex((item: any) => item.sku === activeSku);
      if (existingIndex > -1) {
        // Check stock availability
        if (cart[existingIndex].quantity + 1 > activeStock) {
          toast.error(`Cannot add more. Only ${activeStock} items in stock.`);
          return;
        }
        cart[existingIndex].quantity += 1;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem('rf_cart', JSON.stringify(cart));
      
      // Dispatch event to sync Layout header
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
        
        // Append review to listing locally for immediate feedback
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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Path Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Link href="/" className="hover:text-slate-500">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-350 dark:text-slate-800" />
        <Link href="/shop" className="hover:text-slate-500">Shop</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-350 dark:text-slate-800" />
        <span className="text-slate-600 dark:text-slate-400 font-bold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Grid: Images Column + Actions Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* Left: Product Media Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850">
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover transition-all duration-350"
            />
          </div>
          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative h-20 w-20 rounded-xl overflow-hidden border shrink-0 focus:outline-none ${
                    activeImage === img
                      ? 'border-slate-600 ring-2 ring-slate-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt="Thumbnail view" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product details and action panel */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-950/50 dark:text-slate-400 uppercase tracking-wider">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {product.name}
            </h1>
            <p className="text-xs text-slate-500 tracking-wider">SKU: {activeSku}</p>
          </div>

          {/* Pricing Row */}
          <div className="flex items-center gap-4 py-3 border-y border-slate-200 dark:border-slate-850">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-600 dark:text-slate-400">₹{activePrice}</span>
              {hasDiscount && (
                <span className="text-base text-slate-400 line-through">₹{product.regularPrice}</span>
              )}
            </div>
            {hasDiscount && (
              <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm shadow-rose-600/25">
                Save {discountPercent}%
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-350">
            {product.shortDescription || product.description.split('.')[0] + '.'}
          </p>

          {/* --- VARIANT MATRIX SELECTORS --- */}
          <div className="space-y-4 py-2">
            {/* Sizes Selector */}
            {product.attributes?.sizes && product.attributes.sizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Size:</span>
                <div className="flex gap-2.5">
                  {product.attributes.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition-all border ${
                        selectedSize === size
                          ? 'border-slate-600 bg-slate-600 text-white shadow-md'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
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
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Color:</span>
                <div className="flex gap-2.5">
                  {product.attributes.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition-all border ${
                        selectedColor === color
                          ? 'border-slate-600 bg-slate-600 text-white shadow-md'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
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
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Fabric:</span>
                <div className="flex gap-2.5">
                  {product.attributes.fabrics.map((fab: string) => (
                    <button
                      key={fab}
                      onClick={() => setSelectedFabric(fab)}
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition-all border ${
                        selectedFabric === fab
                          ? 'border-slate-600 bg-slate-600 text-white shadow-md'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {fab}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stock Notification */}
          <div className="flex items-center gap-2 text-xs">
            {activeStock > 0 ? (
              <div className="flex items-center gap-1.5 font-bold text-emerald-505 text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>In Stock ({activeStock} items left)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-bold text-rose-500">
                <AlertCircle className="h-4 w-4" />
                <span>Out of Stock</span>
              </div>
            )}
          </div>

          {/* Add to Cart Actions */}
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              disabled={activeStock <= 0}
              className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all ${
                activeStock > 0
                  ? 'bg-slate-600 hover:bg-slate-500 text-white shadow-lg shadow-slate-600/20 active:scale-[0.99] cursor-pointer'
                  : 'bg-slate-200 text-slate-400 dark:bg-slate-850 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>{activeStock > 0 ? 'Add to Cart' : 'Sold Out'}</span>
            </button>
          </div>

          {/* Shipping Features Props */}
          <div className="grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-850 pt-6 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            <div className="flex flex-col items-center text-center gap-1.5">
              <Truck className="h-5 w-5 text-slate-500" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <RotateCcw className="h-5 w-5 text-slate-500" />
              <span>7 Days Return</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-slate-500" />
              <span>Secure Checkout</span>
            </div>
          </div>

        </div>
      </div>

      {/* Product Long Description */}
      {product.description && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white">Product Description</h2>
          <div
            className="text-xs leading-relaxed text-slate-600 dark:text-slate-350 space-y-3"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </section>
      )}

      {/* --- REVIEWS MODERATION PANEL --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Write a Review */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Customer Feedback</h3>
          
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            {/* Rating Stars selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Your Rating:</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= reviewRating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Review details:</label>
              <textarea
                rows={3}
                placeholder="What did you think of the fabric, stitching, and fits?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-3 focus:border-slate-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-full py-2 rounded-xl bg-slate-950 text-white hover:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-500 text-xs font-bold uppercase transition-all shadow-md"
            >
              {isSubmittingReview ? 'Posting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Reviews Listing */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Reviews ({clientReviews.length})
          </h3>
          
          {clientReviews.length === 0 ? (
            <div className="text-center py-8 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-slate-500">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-slate-400" />
              <p className="text-xs">No customer reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clientReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 shadow-sm space-y-2"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{rev.customerName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  {/* Stars display */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 dark:text-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-350">{rev.comment}</p>

                  {/* Merchant Reply if exists */}
                  {rev.reply && (
                    <div className="mt-2.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-950/60 rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                        <Sparkles className="h-3.5 w-3.5" /> Store Manager Response:
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">{rev.reply}</p>
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
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-850 pb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              You May Also Like
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Recommended Combos</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {similarProducts.map((prod) => {
              const matchesPrice = prod.regularPrice > prod.sellingPrice;
              const matchesPercent = matchesPrice
                ? Math.round(((prod.regularPrice - prod.sellingPrice) / prod.regularPrice) * 100)
                : 0;

              return (
                <Link
                  key={prod.id}
                  href={`/product/${prod.slug}`}
                  className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-950">
                    {matchesPrice && (
                      <span className="absolute top-3 left-3 z-10 rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow-sm">
                        <Tag className="h-2.5 w-2.5" /> {matchesPercent}% Off
                      </span>
                    )}
                    <img
                      src={prod.images && prod.images[0] ? prod.images[0] : 'https://placehold.co/300'}
                      alt={prod.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{prod.brand}</span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-slate-500 transition-colors">
                        {prod.name}
                      </h4>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-black text-slate-600 dark:text-slate-400">₹{prod.sellingPrice}</span>
                      <span className="text-[9px] rounded bg-slate-50 px-1.5 py-0.5 font-bold text-slate-600 dark:bg-slate-950/40 dark:text-slate-400 uppercase">
                        {prod.stock > 0 ? 'In Stock' : 'Sold Out'}
                      </span>
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
