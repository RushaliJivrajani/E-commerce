'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Tag,
  Star,
  ShoppingBag,
  Grid,
  List,
  Loader2,
  X
} from 'lucide-react';

function ShopCatalog() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  // Data State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync category from URL param if it changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);

  // Load products and categories
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/storefront/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setCategories(data.categories || []);
          
          // Set max price based on product data
          if (data.products && data.products.length > 0) {
            const maxPrice = Math.max(...data.products.map((p: any) => p.sellingPrice));
            setPriceRange(prev => ({ ...prev, max: maxPrice || 10000 }));
          }
        }
      } catch (err) {
        console.error('Failed to load shop catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Extract unique brands from active products
  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  // Brand selection handler
  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Filter products
  const filteredProducts = products.filter((prod) => {
    // Search query check
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.tags && prod.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    // Category tree check: Include parent AND children products
    let matchesCategory = true;
    if (selectedCategories.length > 0) {
      const getCategoryAndChildrenIds = (catId: string): string[] => {
        const ids = [catId];
        const children = categories.filter(c => c.parentId === catId);
        children.forEach(child => {
          ids.push(...getCategoryAndChildrenIds(child.id));
        });
        return ids;
      };
      const allowedCategoryIds = selectedCategories.flatMap(c => getCategoryAndChildrenIds(c));
      matchesCategory = allowedCategoryIds.includes(prod.category) || 
                        allowedCategoryIds.includes(prod.subcategory) || 
                        allowedCategoryIds.includes(prod.childcategory);
    }

    // Brands check
    const matchesBrand =
      selectedBrands.length === 0 || selectedBrands.includes(prod.brand);

    // Price checks
    const matchesPrice =
      prod.sellingPrice >= priceRange.min && prod.sellingPrice <= priceRange.max;

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'price-low') {
      return a.sellingPrice - b.sellingPrice;
    }
    if (sortBy === 'price-high') {
      return b.sellingPrice - a.sellingPrice;
    }
    return 0;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    if (products.length > 0) {
      const maxPrice = Math.max(...products.map((p: any) => p.sellingPrice));
      setPriceRange({ min: 0, max: maxPrice || 10000 });
    }
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-400">Loading catalog items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">RUSH APPAREL SHOP</h1>
          <p className="text-xs text-slate-500 mt-1">Showing {sortedProducts.length} premium designs</p>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-md w-full md:w-80">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search items, tags, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-xs focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* --- DESKTOP SIDEBAR FILTERS --- */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6 sticky top-20 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-slate-500" /> Catalog Filters
            </span>
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-500 uppercase tracking-wide cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <hr className="border-border" />

          {/* Categories Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Categories</h3>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {categories.filter(c => !c.parentId).map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-500">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => {
                        setSelectedCategories(prev => 
                          prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                        );
                      }}
                      className="rounded border-slate-300 text-slate-600 focus:ring-slate-500 dark:border-slate-800 dark:bg-slate-950"
                    />
                    <span>{cat.name}</span>
                  </label>
                  
                  {/* Nested subcategories */}
                  {categories.filter(sub => sub.parentId === cat.id).map((sub) => (
                    <label key={sub.id} className="flex items-center gap-2 text-[11px] cursor-pointer text-slate-500 hover:text-slate-400 pl-4">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(sub.id)}
                        onChange={() => {
                          setSelectedCategories(prev => 
                            prev.includes(sub.id) ? prev.filter(c => c !== sub.id) : [...prev, sub.id]
                          );
                        }}
                        className="rounded border-slate-300 text-slate-600 focus:ring-slate-500 dark:border-slate-800 dark:bg-slate-950 scale-90"
                      />
                      <span>{sub.name}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Brands Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Brands</h3>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {availableBrands.map((brand) => (
                <label key={brand} className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-600 dark:text-slate-350 hover:text-slate-500">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    className="rounded border-slate-300 text-slate-600 focus:ring-slate-500 dark:border-slate-800 dark:bg-slate-950"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Price Range Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Price Limit</h3>
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 mb-1">
              <span>₹{priceRange.min}</span>
              <span>₹{priceRange.max}</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(10000, ...products.map((p: any) => p.sellingPrice))}
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
              className="w-full accent-slate-500 cursor-pointer bg-slate-200 dark:bg-slate-800 h-1 rounded-lg"
            />
          </div>
        </aside>

        {/* --- MAIN CATALOG GRID --- */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Sorting and Mobile Filter Toggle */}
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm text-xs font-semibold">
            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>

            <div className="hidden lg:block text-slate-500">
              Showing {sortedProducts.length} items
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none focus:outline-none font-bold text-slate-850 dark:text-white text-xs cursor-pointer select-none"
              >
                <option value="newest" className="dark:bg-slate-900">Newest Arrivals</option>
                <option value="price-low" className="dark:bg-slate-900">Price: Low to High</option>
                <option value="price-high" className="dark:bg-slate-900">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {sortedProducts.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border p-8 space-y-4 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-950">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold">No Products Found</h3>
                <p className="text-xs text-slate-500">Try loosening your search criteria or clearing filter nodes.</p>
              </div>
              <button
                onClick={clearFilters}
                className="inline-flex rounded-xl bg-slate-600 px-4 py-2 text-xs font-bold text-white hover:bg-slate-500 transition-all uppercase tracking-wide cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {sortedProducts.map((prod) => {
                const hasDiscount = prod.regularPrice > prod.sellingPrice;
                const discountPercent = hasDiscount
                  ? Math.round(((prod.regularPrice - prod.sellingPrice) / prod.regularPrice) * 100)
                  : 0;

                return (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.slug}`}
                    className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-500/20 transition-all duration-300 glow-on-hover"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-950">
                      {hasDiscount && (
                        <span className="absolute top-3 left-3 z-10 rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Tag className="h-2.5 w-2.5" /> {discountPercent}% Off
                        </span>
                      )}
                      <img
                        src={prod.images && prod.images[0] ? prod.images[0] : 'https://placehold.co/400?text=Product+Image'}
                        alt={prod.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Content details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{prod.brand}</span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-slate-500 transition-colors">
                          {prod.name}
                        </h3>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-slate-600 dark:text-slate-400">₹{prod.sellingPrice}</span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through">₹{prod.regularPrice}</span>
                          )}
                        </div>
                        
                        <span className="text-[10px] rounded bg-slate-50 px-1.5 py-0.5 font-bold text-slate-600 dark:bg-slate-950/50 dark:text-slate-400 uppercase tracking-wide">
                          {prod.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- MOBILE DRAWER FILTERS --- */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/80 backdrop-blur-sm">
          <div className="w-80 bg-card p-6 border-r border-border flex flex-col h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">FILTER CATALOG</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Categories</h3>
                <div className="flex flex-col gap-2">
                  {categories.filter(c => !c.parentId).map((cat) => (
                    <div key={cat.id} className="space-y-1">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => {
                            setSelectedCategories(prev => 
                              prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                            );
                          }}
                          className="rounded border-slate-300 text-slate-600 focus:ring-slate-500 dark:border-slate-800 dark:bg-slate-950"
                        />
                        <span>{cat.name}</span>
                      </label>
                      {/* Nested subcategories */}
                      {categories.filter(sub => sub.parentId === cat.id).map((sub) => (
                        <label key={sub.id} className="flex items-center gap-2 text-[11px] cursor-pointer text-slate-500 pl-4">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(sub.id)}
                            onChange={() => {
                              setSelectedCategories(prev => 
                                prev.includes(sub.id) ? prev.filter(c => c !== sub.id) : [...prev, sub.id]
                              );
                            }}
                            className="rounded border-slate-300 text-slate-600 focus:ring-slate-500 dark:border-slate-800 dark:bg-slate-950 scale-90"
                          />
                          <span>{sub.name}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* Brands */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Brands</h3>
                <div className="flex flex-col gap-2">
                  {availableBrands.map((brand) => (
                    <label key={brand} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                        className="rounded border-slate-300 text-slate-600 focus:ring-slate-500 dark:border-slate-800 dark:bg-slate-950"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* Price */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Price Limit</h3>
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
                  <span>₹{priceRange.min}</span>
                  <span>₹{priceRange.max}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(10000, ...products.map((p: any) => p.sellingPrice))}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-full accent-slate-500 cursor-pointer bg-slate-200 dark:bg-slate-850 h-1 rounded"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => { clearFilters(); setMobileFiltersOpen(false); }}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-900 text-center dark:bg-slate-800 dark:text-white"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-xs font-bold text-white text-center"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-400">Loading catalog layout...</p>
        </div>
      </div>
    }>
      <ShopCatalog />
    </Suspense>
  );
}
