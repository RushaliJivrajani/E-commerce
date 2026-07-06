'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingBag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import gsap from 'gsap';

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [activeColor, setActiveColor] = useState(
    product.attributes?.colors && product.attributes.colors.length > 0
      ? product.attributes.colors[0]
      : ''
  );
  const [addingToCart, setAddingToCart] = useState(false);

  const hasDiscount = product.regularPrice > product.sellingPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.regularPrice - product.sellingPrice) / product.regularPrice) * 100)
    : 0;

  // Stock level status
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const isOutOfStock = product.stock <= 0;

  // Handle Quick Add to Cart
  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error('This product is sold out!');
      return;
    }

    setAddingToCart(true);

    try {
      const cartStr = localStorage.getItem('rf_cart');
      let cart = cartStr ? JSON.parse(cartStr) : [];

      // Determine default attributes if any
      const selectedSize = product.attributes?.sizes && product.attributes.sizes.length > 0 ? product.attributes.sizes[0] : '';
      const selectedFabric = product.attributes?.fabrics && product.attributes.fabrics.length > 0 ? product.attributes.fabrics[0] : '';

      const variantInfoParts = [];
      if (selectedSize) variantInfoParts.push(`Size: ${selectedSize}`);
      if (activeColor) variantInfoParts.push(`Color: ${activeColor}`);
      if (selectedFabric) variantInfoParts.push(`Fabric: ${selectedFabric}`);
      const variantInfo = variantInfoParts.join(', ');

      // Find matching variant SKU
      let finalSku = product.id;
      let finalPrice = product.sellingPrice;
      let finalStock = product.stock;

      if (product.variants && product.variants.length > 0) {
        const matched = product.variants.find((v: any) => {
          const matchesSize = !selectedSize || v.size === selectedSize;
          const matchesColor = !activeColor || v.color === activeColor;
          const matchesFabric = !selectedFabric || v.fabric === selectedFabric;
          return matchesSize && matchesColor && matchesFabric;
        });
        if (matched) {
          finalSku = matched.sku;
          finalPrice = matched.price || product.sellingPrice;
          finalStock = matched.stock;
        }
      }

      const cartItem = {
        productId: product.id,
        name: product.name,
        sku: finalSku,
        price: finalPrice,
        quantity: 1,
        image: product.images && product.images[0] ? product.images[0] : 'https://placehold.co/100',
        variantInfo
      };

      const existingIndex = cart.findIndex((item: any) => item.sku === finalSku);
      if (existingIndex > -1) {
        if (cart[existingIndex].quantity + 1 > finalStock) {
          toast.error(`Cannot add more. Only ${finalStock} items in stock.`);
          setAddingToCart(false);
          return;
        }
        cart[existingIndex].quantity += 1;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem('rf_cart', JSON.stringify(cart));
      
      // FLY TO CART ANIMATION
      const buttonEl = e.currentTarget as HTMLElement;
      const imgRef = buttonEl.closest('.group')?.querySelector('img');
      const cartIcon = document.querySelector('a[href="/cart"]');

      if (imgRef && cartIcon) {
        const imgRect = imgRef.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();
        const clone = imgRef.cloneNode(true) as HTMLImageElement;
        
        clone.style.position = 'fixed';
        clone.style.left = `${imgRect.left}px`;
        clone.style.top = `${imgRect.top}px`;
        clone.style.width = `${imgRect.width}px`;
        clone.style.height = `${imgRect.height}px`;
        clone.style.zIndex = '9999';
        clone.style.borderRadius = '16px';
        clone.style.pointerEvents = 'none';
        clone.style.objectFit = 'cover';
        document.body.appendChild(clone);

        // Arc animation: X and Y use different eases to simulate gravity/arc
        gsap.to(clone, {
          x: (cartRect.left + cartRect.width / 2) - (imgRect.left + imgRect.width / 2),
          duration: 0.8,
          ease: 'power1.out',
        });
        
        gsap.to(clone, {
          y: (cartRect.top + cartRect.height / 2) - (imgRect.top + imgRect.height / 2),
          scale: 0.1,
          opacity: 0.3,
          duration: 0.8,
          ease: 'power2.in',
          onComplete: () => {
            clone.remove();
            gsap.fromTo(cartIcon, { scale: 1 }, { scale: 1.4, yoyo: true, repeat: 1, duration: 0.15 });
            window.dispatchEvent(new Event('rf-cart-changed'));
          }
        });
      } else {
        window.dispatchEvent(new Event('rf-cart-changed'));
      }
      
      toast.success(`${product.name} added to cart!`, {
        icon: '🛍️',
        style: {
          borderRadius: '10px',
          background: 'var(--foreground)',
          color: 'var(--background)',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 'bold'
        },
      });
    } catch (err) {
      toast.error('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const mainImage = product.images && product.images[0] ? product.images[0] : 'https://placehold.co/400?text=Product+Image';
  const hoverImage = product.images && product.images[1] ? product.images[1] : mainImage;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Link
        href={`/product/${product.slug}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group flex flex-col h-full rounded-3xl overflow-hidden bg-card text-foreground transition-all duration-300 p-2.5 relative border border-border/40 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10"
      >
      {/* Product Image & Overlays */}
      <div className="relative aspect-[4/5] overflow-hidden bg-card border border-border/20 mb-4 rounded-2xl">
        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3.5 left-3.5 z-10 bg-primary px-2.5 py-1 text-[10px] font-bold text-white rounded-md tracking-wider uppercase border border-primary/50">
            -{discountPercent}% OFF
          </span>
        )}

        {/* Stock Urgency Badges */}
        <AnimatePresence>
          {isLowStock && (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-3.5 right-3.5 z-10 bg-orange-600 px-2.5 py-1 text-[10px] font-bold text-white rounded-md tracking-wider uppercase border border-orange-500/50"
            >
              ONLY {product.stock} LEFT
            </motion.span>
          )}
          {isOutOfStock && (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-3.5 right-3.5 z-10 bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground rounded-md tracking-wider uppercase border border-border/50"
            >
              SOLD OUT
            </motion.span>
          )}
        </AnimatePresence>

        {/* Primary/Secondary Image Crossfade */}
        <div className="w-full h-full relative">
          <img
            src={mainImage}
            alt={product.name}
            className={`h-full w-full object-cover transition-all duration-700 ease-in-out ${
              hovered && product.images?.length > 1 ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
            loading="lazy"
          />
          {product.images?.length > 1 && (
            <img
              src={hoverImage}
              alt={`${product.name} alternate view`}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out ${
                hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              loading="lazy"
            />
          )}
        </div>

        {/* Quick Add Overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 z-10">
            <motion.button
              type="button"
              onClick={handleQuickAdd}
              disabled={addingToCart}
              initial={{ opacity: 0, y: 15 }}
              animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full bg-foreground text-background hover:bg-primary hover:text-white py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-colors border border-border/20 cursor-pointer"
            >
              {addingToCart ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Quick Add
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col space-y-1.5 px-2 pb-2">
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{product.brand}</span>
        <h3 className="text-xs font-semibold text-foreground line-clamp-2 h-9 group-hover:text-primary transition-colors tracking-wide">
          {product.name}
        </h3>
        
        {/* Rating & Review Count */}
        <div className="flex items-center gap-1.5">
          <div className="flex text-primary">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-3 w-3 fill-current stroke-current" />
            ))}
          </div>
          <span className="text-[10px] font-bold text-muted-foreground">(4.8)</span>
        </div>

        {/* Price & Color Swatches */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30 mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-foreground">₹{product.sellingPrice.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-[11px] font-bold text-muted-foreground line-through">₹{product.regularPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Color Swatch Previews */}
          {product.attributes?.colors && product.attributes.colors.length > 0 && (
            <div className="flex gap-1">
              {product.attributes.colors.slice(0, 3).map((color: string) => {
                const isActive = activeColor === color;
                return (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveColor(color);
                    }}
                    title={color}
                    className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                      isActive ? 'border-primary ring-1 ring-primary' : 'border-border'
                    }`}
                    style={{
                      backgroundColor:
                        color.toLowerCase() === 'black' ? '#000000' :
                        color.toLowerCase() === 'white' ? '#FFFFFF' :
                        color.toLowerCase() === 'red' ? '#FF2D2D' :
                        color.toLowerCase() === 'grey' || color.toLowerCase() === 'gray' ? '#888888' :
                        color.toLowerCase() === 'blue' ? '#0000FF' :
                        color.toLowerCase() === 'green' ? '#008000' :
                        color.toLowerCase() === 'yellow' ? '#FFFF00' :
                        color.toLowerCase() === 'pink' ? '#FFC0CB' : '#CCCCCC'
                    }}
                  />
                );
              })}
              {product.attributes.colors.length > 3 && (
                <span className="text-[9px] font-bold text-muted-foreground self-center ml-0.5">
                  +{product.attributes.colors.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      </Link>
    </motion.div>
  );
}
