'use client';

import React, { useState, useEffect } from'react';
import toast from'react-hot-toast';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Edit,
  Trash2,
  Settings2,
  ArrowRight,
  Loader2,
  Video,
  Eye,
  Percent,
  Calculator,
  ArrowUp,
  ArrowDown,
  X,
  FileSpreadsheet,
  Check,
  AlertTriangle,
  MoveUp,
  MoveDown
} from'lucide-react';

interface Variant {
  sku: string;
  barcode?: string;
  size?: string;
  color?: string;
  fabric?: string;
  stock: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory?: string;
  childcategory?: string;
  brand: string;
  tags: string[];
  images: string[];
  video?: string;
  regularPrice: number;
  sellingPrice: number;
  costPrice: number;
  taxRate: number;
  stock: number;
  lowStockAlert: number;
  featured: boolean;
  trending: boolean;
  bestSeller: boolean;
  status:'Active' |'Inactive';
  attributes: {
    sizes: string[];
    colors: string[];
    fabrics: string[];
  };
  variants: Variant[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  imageAlt?: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export default function ProductsPage() {
  // DB States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' |'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Excel Importer Modal State
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelDataText, setExcelDataText] = useState(
`Product Name\tCategory\tRegular Price\tSelling Price\tStock\tSKU\nSummer Cotton Tee\tcat_1\t999\t799\t50\tRF-SCT-M\nMidnight Party Gown\tcat_1_sub1\t4999\t3999\t15\tRF-MPG-L`
  );

  // Core Form Fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formChildcategory, setFormChildcategory] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [newImageLink, setNewImageLink] = useState('');
  const [formVideo, setFormVideo] = useState('');
  const [formRegularPrice, setFormRegularPrice] = useState('0');
  const [formSellingPrice, setFormSellingPrice] = useState('0');
  const [formCostPrice, setFormCostPrice] = useState('0');
  const [formTaxRate, setFormTaxRate] = useState('18');
  const [formStock, setFormStock] = useState('0');
  const [formLowStockAlert, setFormLowStockAlert] = useState('10');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formTrending, setFormTrending] = useState(false);
  const [formBestSeller, setFormBestSeller] = useState(false);
  const [formStatus, setFormStatus] = useState<'Active' |'Inactive'>('Active');

  // SEO Fields
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formMetaKeywords, setFormMetaKeywords] = useState('');
  const [formImageAlt, setFormImageAlt] = useState('');

  // Attribute Lists in Form
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  
  // Custom Tag Inputs
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newFabric, setNewFabric] = useState('');

  // Generated Variants List
  const [formVariants, setFormVariants] = useState<Variant[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch products and categories
  const fetchData = async () => {
    try {
      const pRes = await fetch('/api/products');
      const cRes = await fetch('/api/categories');
      if (pRes.ok && cRes.ok) {
        const pData = await pRes.json();
        const cData = await cRes.json();
        setProducts(pData.products);
        setCategories(cData.categories);
      } else {
        toast.error('Failed to load products/categories data');
      }
    } catch (err) {
      toast.error('Error fetching catalog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Regenerate variants dynamically based on chosen attributes
  const handleRegenerateVariants = () => {
    const list = [
      selectedSizes.length > 0 ? selectedSizes : [''],
      selectedColors.length > 0 ? selectedColors : [''],
      selectedFabrics.length > 0 ? selectedFabrics : ['']
    ];

    const combinations: any[] = [];
    
    function helper(arr: any[][], idx: number, current: any) {
      if (idx === arr.length) {
        combinations.push(current);
        return;
      }
      for (let j = 0; j < arr[idx].length; j++) {
        helper(arr, idx + 1, {
          ...current,
          [idx === 0 ?'size' : idx === 1 ?'color' :'fabric']: arr[idx][j]
        });
      }
    }
    
    helper(list, 0, {});

    const basePrice = Number(formSellingPrice) || 0;
    const baseName = formName ||'RF';
    const baseCode = baseName.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0, 4);

    const generated: Variant[] = combinations.map((combo, index) => {
      // Map attributes
      const sizeStr = combo.size ?`-${combo.size}` :'';
      const colorStr = combo.color ?`-${combo.color.replace(/\s+/g,'').toUpperCase().slice(0, 3)}` :'';
      const fabricStr = combo.fabric ?`-${combo.fabric.replace(/\s+/g,'').toUpperCase().slice(0, 3)}` :'';
      
      const variantSku =`RF-${baseCode}${sizeStr}${colorStr}${fabricStr}`;

      return {
        sku: variantSku,
        barcode:'',
        size: combo.size || undefined,
        color: combo.color || undefined,
        fabric: combo.fabric || undefined,
        stock: 10, // Default variant stock
        price: basePrice, // Default variant price
      };
    });

    setFormVariants(generated);
    toast.success(`Generated ${generated.length} product combinations!`);
  };

  // Open forms
  const handleOpenAdd = () => {
    setModalType('add');
    setSelectedProduct(null);
    setFormName('');
    setFormDescription('');
    setFormShortDescription('');
    setFormCategory('');
    setFormSubcategory('');
    setFormChildcategory('');
    setFormBrand('');
    setFormTags('');
    setFormImages([]);
    setFormVideo('');
    setFormRegularPrice('0');
    setFormSellingPrice('0');
    setFormCostPrice('0');
    setFormTaxRate('18');
    setFormStock('0');
    setFormLowStockAlert('10');
    setFormFeatured(false);
    setFormTrending(false);
    setFormBestSeller(false);
    setFormStatus('Active');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormMetaKeywords('');
    setFormImageAlt('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedFabrics([]);
    setFormVariants([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setModalType('edit');
    setSelectedProduct(product);
    setFormName(product.name);
    setFormDescription(product.description ||'');
    setFormShortDescription(product.shortDescription ||'');
    setFormCategory(product.category);
    setFormSubcategory(product.subcategory ||'');
    setFormChildcategory(product.childcategory ||'');
    setFormBrand(product.brand ||'');
    setFormTags(product.tags ? product.tags.join(',') :'');
    setFormImages(product.images || []);
    setFormVideo(product.video ||'');
    setFormRegularPrice(product.regularPrice.toString());
    setFormSellingPrice(product.sellingPrice.toString());
    setFormCostPrice(product.costPrice.toString());
    setFormTaxRate(product.taxRate.toString());
    setFormStock(product.stock.toString());
    setFormLowStockAlert(product.lowStockAlert.toString());
    setFormFeatured(product.featured);
    setFormTrending(product.trending);
    setFormBestSeller(product.bestSeller);
    setFormStatus(product.status);
    setFormSeoTitle(product.seoTitle ||'');
    setFormSeoDescription(product.seoDescription ||'');
    setFormMetaKeywords(product.metaKeywords ||'');
    setFormImageAlt(product.imageAlt ||'');
    setSelectedSizes(product.attributes?.sizes || []);
    setSelectedColors(product.attributes?.colors || []);
    setSelectedFabrics(product.attributes?.fabrics || []);
    setFormVariants(product.variants || []);
    setModalOpen(true);
  };

  // Image helpers
  const addImage = () => {
    if (!newImageLink) return;
    setFormImages([...formImages, newImageLink]);
    setNewImageLink('');
  };

  const moveImage = (index: number, direction:'up' |'down') => {
    const updated = [...formImages];
    const targetIdx = direction ==='up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    
    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFormImages(updated);
  };

  const removeImage = (index: number) => {
    setFormImages(formImages.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCategory) {
      toast.error('Product Name and Category are required');
      return;
    }

    setSaving(true);
    const tagsArray = formTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t);

    // Sum variants stock if variants exist
    const finalStock = formVariants.length > 0
      ? formVariants.reduce((sum, v) => sum + Number(v.stock), 0)
      : Number(formStock);

    const payload = {
      name: formName,
      description: formDescription,
      shortDescription: formShortDescription,
      category: formCategory,
      subcategory: formSubcategory || undefined,
      childcategory: formChildcategory || undefined,
      brand: formBrand,
      tags: tagsArray,
      images: formImages,
      video: formVideo,
      regularPrice: Number(formRegularPrice),
      sellingPrice: Number(formSellingPrice),
      costPrice: Number(formCostPrice),
      taxRate: Number(formTaxRate),
      stock: finalStock,
      lowStockAlert: Number(formLowStockAlert),
      featured: formFeatured,
      trending: formTrending,
      bestSeller: formBestSeller,
      status: formStatus,
      seoTitle: formSeoTitle,
      seoDescription: formSeoDescription,
      metaKeywords: formMetaKeywords,
      imageAlt: formImageAlt,
      attributes: {
        sizes: selectedSizes,
        colors: selectedColors,
        fabrics: selectedFabrics,
      },
      variants: formVariants,
    };

    try {
      const url = modalType ==='add' ?'/api/products' :`/api/products/${selectedProduct?.id}`;
      const method = modalType ==='add' ?'POST' :'PATCH';

      const res = await fetch(url, {
        method,
        headers: {'Content-Type':'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(modalType ==='add' ?'Product created!' :'Product updated!');
        setModalOpen(false);
        fetchData();
      } else {
        const errData = await res.json();
        toast.error(errData.message ||'Error processing request');
      }
    } catch (err) {
      toast.error('Connection request failed');
    } finally {
      setSaving(false);
    }
  };

  // Duplicate Product
  const handleDuplicate = async (product: Product) => {
    const loader = toast.loading('Duplicating product...');
    const duplicateData = {
      ...product,
      name:`${product.name} (Copy)`,
      status:'Inactive' as const, // Inactivate copy by default
      createdAt: undefined,
      id: undefined,
    };

    try {
      const res = await fetch('/api/products', {
        method:'POST',
        headers: {'Content-Type':'application/json' },
        body: JSON.stringify(duplicateData),
      });
      if (res.ok) {
        toast.success('Product duplicated successfully!', { id: loader });
        fetchData();
      } else {
        toast.error('Failed to duplicate product', { id: loader });
      }
    } catch (e) {
      toast.error('Duplicate action failed', { id: loader });
    }
  };

  // Delete Product
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action is irreversible.')) {
      return;
    }
    try {
      const res = await fetch(`/api/products/${id}`, { method:'DELETE' });
      if (res.ok) {
        toast.success('Product deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (e) {
      toast.error('Delete request failed');
    }
  };

  // Export JSON/CSV Handlers
  const handleExportJSON = () => {
    const dataStr ='data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download','rush_fashion_products.json');
    dlAnchor.click();
    toast.success('JSON file exported successfully!');
  };

  const handleExportCSV = () => {
    let csvContent ='data:text/csv;charset=utf-8,';
    csvContent +='ID,Product Name,Brand,Category,Selling Price,Regular Price,Stock,SKU,Status\n';

    products.forEach((p) => {
      csvContent +=`"${p.id}","${p.name}","${p.brand}","${p.category}",${p.sellingPrice},${p.regularPrice},${p.stock},"${p.variants?.[0]?.sku ||''}","${p.status}"\n`;
    });

    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', encodeURI(csvContent));
    dlAnchor.setAttribute('download','rush_fashion_products.csv');
    dlAnchor.click();
    toast.success('CSV file exported successfully!');
  };

  // Bulk Excel Importer Simulation
  const handleExcelImport = async () => {
    const lines = excelDataText.split('\n');
    if (lines.length < 2) {
      toast.error('Excel spreadsheet must contain headers and at least 1 row of data.');
      return;
    }

    setSaving(true);
    let importCount = 0;
    try {
      // Loop through lines (skip header line)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split('\t');
        if (columns.length < 4) continue;

        const [name, category, regularPrice, sellingPrice, stock, sku] = columns;

        const mockProduct = {
          name,
          category,
          regularPrice: Number(regularPrice) || 0,
          sellingPrice: Number(sellingPrice) || 0,
          stock: Number(stock) || 0,
          brand:'Spreadsheet Import',
          status:'Active',
          variants: sku ? [{ sku, stock: Number(stock) || 0, price: Number(sellingPrice) || 0 }] : [],
        };

        const res = await fetch('/api/products', {
          method:'POST',
          headers: {'Content-Type':'application/json' },
          body: JSON.stringify(mockProduct),
        });

        if (res.ok) importCount++;
      }

      toast.success(`Successfully imported ${importCount} items!`);
      setExcelModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Bulk import encountered failures');
    } finally {
      setSaving(false);
    }
  };

  // Profit calculations in Form
  const calcProfit = () => {
    const sell = Number(formSellingPrice) || 0;
    const cost = Number(formCostPrice) || 0;
    const profit = sell - cost;
    const margin = sell > 0 ? (profit / sell) * 100 : 0;
    return { profit, margin };
  };

  const profitInfo = calcProfit();

  // Filter Catalog
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.variants && p.variants.some((v) => v.sku.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = categoryFilter ? p.category === categoryFilter || p.subcategory === categoryFilter : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 glass-panel p-8 rounded-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-semibold text-slate-500">Loading catalog items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Product Catalog <ShoppingBag className="h-6 w-6 text-indigo-500" />
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            CRUD manager, variant matrices, duplicate actions, and spreadsheet importing.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Export items */}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 border border-slate-300 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" /> Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 border border-slate-300 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>

          {/* Excel Importer Trigger */}
          <button
            onClick={() => setExcelModalOpen(true)}
            className="flex items-center gap-2 border border-slate-300 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors shadow-sm"
          >
            <Upload className="h-4 w-4" /> Bulk Import
          </button>

          {/* Add product button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-slate-900 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-800 transition-colors shadow-md"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Directory Filter Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 max-w-5xl">
        {/* Search */}
        <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-xl px-3 py-2 col-span-1 sm:col-span-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow shadow-sm">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, brand, slug or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-slate-900 focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow shadow-sm">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow shadow-sm">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="glass-panel rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs font-semibold bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Brand / Slug</th>
                <th className="px-6 py-4 text-right">Retail Price</th>
                <th className="px-6 py-4 text-center">In Stock</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Badges</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const totalStock = p.variants && p.variants.length > 0
                  ? p.variants.reduce((sum, v) => sum + v.stock, 0)
                  : p.stock;

                const isLow = totalStock <= p.lowStockAlert;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={p.images?.[0] ||'https://placehold.co/50x50?text=No+Img'}
                          alt={p.name}
                          className="h-12 w-12 object-cover bg-slate-100 rounded-xl border border-slate-200"
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-900 block truncate tracking-wide">{p.name}</span>
                          <span className="text-xs text-slate-500 block mt-0.5">SKU: {p.variants?.[0]?.sku ||'No SKU'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900 block">{p.brand}</span>
                      <span className="text-xs text-slate-500 block mt-0.5">/{p.slug}</span>
                    </td>

                    <td className="px-6 py-4 text-right text-xs font-bold text-indigo-600 tracking-wide">
                      ₹{p.sellingPrice.toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${isLow ?'text-rose-600' :'text-teal-600'}`}>
                        {isLow && <AlertTriangle className="h-3 w-3" strokeWidth={2} />}
                        {totalStock}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                          p.status ==='Active'
                            ?'bg-teal-50 text-teal-600 border-teal-200'
                            :'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {p.featured && <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">Feat</span>}
                        {p.trending && <span className="bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">Trend</span>}
                        {p.bestSeller && <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">Best</span>}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="text-slate-400 hover:text-slate-900 transition-colors"
                          title="Duplicate Product"
                        >
                          <Copy className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="text-slate-400 hover:text-slate-900 transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[10px] font-bold uppercase tracking-widest text-slate-500">No products found matching query settings.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT PRODUCT MODAL PANEL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="relative w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl   max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900  mb-6">
              {modalType ==='add' ?'Add Catalog Product' :'Edit Catalog Product'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6 text-sm">
              
              {/* SECTION: BASIC INFO */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100  pb-2">
                  1. Basic Product Particulars
                </span>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Product Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Elegant Silk Saree, Classic Blazer"
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Brand</label>
                    <input
                      type="text"
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      placeholder="e.g. Rush Signature"
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Short Description</label>
                    <input
                      type="text"
                      value={formShortDescription}
                      onChange={(e) => setFormShortDescription(e.target.value)}
                      placeholder="Summary highlights shown in listing hover..."
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Full Product Description</label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={3}
                      placeholder="Complete product summary specifications..."
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>

                  {/* Categories tree selectors */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Category</label>
                    <select
                      required
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Subcategory (Optional)</label>
                    <input
                      type="text"
                      value={formSubcategory}
                      onChange={(e) => setFormSubcategory(e.target.value)}
                      placeholder="Category ID or Slug"
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Child Category (Optional)</label>
                    <input
                      type="text"
                      value={formChildcategory}
                      onChange={(e) => setFormChildcategory(e.target.value)}
                      placeholder="e.g. party-wear"
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="velvet, designer, nightdress"
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: MEDIA */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100  pb-2">
                  2. Media uploads & sorting
                </span>
                
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Add Product Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newImageLink}
                      onChange={(e) => setNewImageLink(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 focus:outline-none   text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-4"
                    >
                      Add Url
                    </button>
                  </div>

                  {/* Drag/Click sorting list */}
                  {formImages.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 border border-slate-100  rounded-xl p-3 bg-slate-950/20">
                      <span className="text-xs font-bold text-slate-500">Image Array Ordering (Top image is Primary thumbnail):</span>
                      {formImages.map((img, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white  border border-slate-100  text-xs">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <img src={img} className="h-8 w-8 object-cover rounded" />
                            <span className="truncate text-slate-400 max-w-[250px]">{img}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveImage(idx,'up')} disabled={idx === 0} className="p-1 rounded hover:bg-slate-100  disabled:opacity-30 text-slate-900"><MoveUp className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => moveImage(idx,'down')} disabled={idx === formImages.length - 1} className="p-1 rounded hover:bg-slate-100  disabled:opacity-30 text-slate-900"><MoveDown className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => removeImage(idx)} className="p-1 rounded text-rose-500 hover:bg-rose-500/10"><X className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase">Product Video Link (Optional)</label>
                      <div className="relative mt-1">
                        <Video className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          value={formVideo}
                          onChange={(e) => setFormVideo(e.target.value)}
                          placeholder="Youtube/Vimeo Link"
                          className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 focus:outline-none   text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: PRICING & INVENTORY */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100  pb-2">
                  3. Pricing & Financial calculations
                </span>
                
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Regular Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formRegularPrice}
                      onChange={(e) => setFormRegularPrice(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formSellingPrice}
                      onChange={(e) => setFormSellingPrice(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Cost Price (₹)</label>
                    <input
                      type="number"
                      value={formCostPrice}
                      onChange={(e) => setFormCostPrice(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Tax Rate (GST %)</label>
                    <select
                      value={formTaxRate}
                      onChange={(e) => setFormTaxRate(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    >
                      <option value="0">0% (Exempt)</option>
                      <option value="5">5% (Standard Apparel)</option>
                      <option value="12">12% (Medium Premium)</option>
                      <option value="18">18% (Luxury Goods)</option>
                    </select>
                  </div>
                </div>

                {/* Live Profit Margin Calculator */}
                <div className="rounded-xl border border-slate-100 bg-slate-500/5 p-4  flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calculator className="h-4 w-4" />
                    <span className="font-bold">Live Profit Estimation:</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-slate-900">Net Profit: <span className={`font-bold ${profitInfo.profit >= 0 ?'text-teal-400' :'text-rose-400'}`}>₹{profitInfo.profit}</span></div>
                    <div className="text-slate-900">Margin: <span className={`font-bold ${profitInfo.profit >= 0 ?'text-teal-400' :'text-rose-400'}`}>{profitInfo.margin.toFixed(1)}%</span></div>
                  </div>
                </div>

                {/* Base Inventory */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {formVariants.length === 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase">Stock Quantity</label>
                      <input
                        type="number"
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Low Stock Alert Level</label>
                    <input
                      type="number"
                      value={formLowStockAlert}
                      onChange={(e) => setFormLowStockAlert(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>

                  {/* Status & Swtiches */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Product Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Badges flags */}
                <div className="flex gap-6 mt-2 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-900">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="rounded border-slate-700 text-slate-600 focus:ring-slate-500"
                    />
                    <span>Featured Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-900">
                    <input
                      type="checkbox"
                      checked={formTrending}
                      onChange={(e) => setFormTrending(e.target.checked)}
                      className="rounded border-slate-700 text-slate-600 focus:ring-slate-500"
                    />
                    <span>Trending Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-900">
                    <input
                      type="checkbox"
                      checked={formBestSeller}
                      onChange={(e) => setFormBestSeller(e.target.checked)}
                      className="rounded border-slate-700 text-slate-600 focus:ring-slate-500"
                    />
                    <span>Best Seller Product</span>
                  </label>
                </div>
              </div>

              {/* SECTION: ATTRIBUTES & VARIANTS */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100  pb-2">
                  4. Variant Attributes Matrix
                </span>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  
                  {/* Sizes tag editor */}
                  <div className="rounded-xl border border-slate-100  p-3">
                    <label className="block text-xs font-bold text-slate-400">SIZES (e.g. S, M, XL)</label>
                    <div className="flex gap-1 mt-1">
                      <input
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        placeholder="Add size"
                        className="w-full rounded bg-slate-50 border border-slate-200   py-1 px-2 text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => { if(newSize){ setSelectedSizes([...selectedSizes, newSize.toUpperCase()]); setNewSize(''); } }}
                        className="bg-slate-600 text-slate-900 rounded px-2.5 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {selectedSizes.map((s) => (
                        <span key={s} className="bg-slate-500/10 text-slate-400 rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                          {s} <X className="h-3 w-3 cursor-pointer text-rose-500" onClick={() => setSelectedSizes(selectedSizes.filter(sz => sz !== s))} />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Colors tag editor */}
                  <div className="rounded-xl border border-slate-100  p-3">
                    <label className="block text-xs font-bold text-slate-400">COLORS (e.g. Red, Black)</label>
                    <div className="flex gap-1 mt-1">
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        placeholder="Add color"
                        className="w-full rounded bg-slate-50 border border-slate-200   py-1 px-2 text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => { if(newColor){ setSelectedColors([...selectedColors, newColor]); setNewColor(''); } }}
                        className="bg-slate-600 text-slate-900 rounded px-2.5 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {selectedColors.map((c) => (
                        <span key={c} className="bg-slate-500/10 text-slate-400 rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                          {c} <X className="h-3 w-3 cursor-pointer text-rose-500" onClick={() => setSelectedColors(selectedColors.filter(cr => cr !== c))} />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Fabrics tag editor */}
                  <div className="rounded-xl border border-slate-100  p-3">
                    <label className="block text-xs font-bold text-slate-400">FABRICS (e.g. Cotton, Silk)</label>
                    <div className="flex gap-1 mt-1">
                      <input
                        type="text"
                        value={newFabric}
                        onChange={(e) => setNewFabric(e.target.value)}
                        placeholder="Add fabric"
                        className="w-full rounded bg-slate-50 border border-slate-200   py-1 px-2 text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => { if(newFabric){ setSelectedFabrics([...selectedFabrics, newFabric]); setNewFabric(''); } }}
                        className="bg-slate-600 text-slate-900 rounded px-2.5 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {selectedFabrics.map((f) => (
                        <span key={f} className="bg-pink-500/10 text-pink-400 rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                          {f} <X className="h-3 w-3 cursor-pointer text-rose-500" onClick={() => setSelectedFabrics(selectedFabrics.filter(fb => fb !== f))} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate combinations trigger button */}
                <button
                  type="button"
                  onClick={handleRegenerateVariants}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-400"
                >
                  <Settings2 className="h-4 w-4" /> Compute & Generate Variant Combinations Matrix
                </button>

                {/* Variants List Editor grid */}
                {formVariants.length > 0 && (
                  <div className="border border-slate-100  rounded-xl p-4 bg-slate-950/10 space-y-2">
                    <span className="text-xs font-bold text-slate-400 block border-b border-slate-800 pb-2">Edit Variant Prices & Stock levels:</span>
                    <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-slate-400 uppercase">
                      <span className="col-span-2">Variant / SKU</span>
                      <span>Stock level</span>
                      <span className="text-right">Price (₹)</span>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {formVariants.map((v, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 items-center text-xs">
                          <div className="col-span-2">
                            <span className="font-bold text-slate-900  block">
                              {[v.size, v.color, v.fabric].filter(val => val).join(' /')}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">SKU: {v.sku}</span>
                          </div>
                          
                          <input
                            type="number"
                            value={v.stock}
                            onChange={(e) => {
                              const updated = [...formVariants];
                              updated[index].stock = Number(e.target.value);
                              setFormVariants(updated);
                            }}
                            className="rounded bg-slate-50  border border-slate-200  px-2 py-1 text-slate-900"
                          />

                          <input
                            type="number"
                            value={v.price}
                            onChange={(e) => {
                              const updated = [...formVariants];
                              updated[index].price = Number(e.target.value);
                              setFormVariants(updated);
                            }}
                            className="rounded bg-slate-50  border border-slate-200  px-2 py-1 text-slate-900  text-right font-bold"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: SEO MANAGEMENT */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block pb-2">
                  SEO Management
                </span>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Meta Title</label>
                    <input
                      type="text"
                      value={formSeoTitle}
                      onChange={(e) => setFormSeoTitle(e.target.value)}
                      placeholder="e.g. Buy Elegant Silk Saree Online | Rush Closet"
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Meta Description</label>
                    <textarea
                      value={formSeoDescription}
                      onChange={(e) => setFormSeoDescription(e.target.value)}
                      rows={2}
                      placeholder="High converting meta description snippet..."
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Target Keywords</label>
                    <input
                      type="text"
                      value={formMetaKeywords}
                      onChange={(e) => setFormMetaKeywords(e.target.value)}
                      placeholder="saree, silk, ethnic"
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Image ALT Tags</label>
                    <input
                      type="text"
                      value={formImageAlt}
                      onChange={(e) => setFormImageAlt(e.target.value)}
                      placeholder="e.g. Red silk saree front view"
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 focus:outline-none   text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action footer */}
              <div className="flex justify-end gap-3 border-t border-slate-100  pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-slate-600 px-5 py-2.5 text-xs font-semibold text-slate-900 hover:opacity-90 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modalType ==='add' ?'Create Product' :'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- BULK SPREADSHEET IMPORTER MODAL --- */}
      {excelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setExcelModalOpen(false)} />
          
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setExcelModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900  mb-2 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-teal-500" /> Excel Spreadsheet Importer
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Paste your spreadsheet rows below (tab-delimited, standard copy-paste from Excel or Google Sheets). Columns must be: <br/>
              <code className="text-teal-400 font-semibold font-mono">Product Name &emsp; Category &emsp; Regular Price &emsp; Selling Price &emsp; Stock &emsp; SKU</code>
            </p>

            <textarea
              value={excelDataText}
              onChange={(e) => setExcelDataText(e.target.value)}
              rows={8}
              className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none   text-slate-900"
            />

            {/* Importer action footer */}
            <div className="flex justify-end gap-3 border-t border-slate-100  pt-4 mt-6">
              <button
                type="button"
                onClick={() => setExcelModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExcelImport}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-slate-600 px-5 py-2.5 text-xs font-bold text-slate-900 hover:opacity-90 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Import Spreadsheet Rows
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
