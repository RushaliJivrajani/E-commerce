import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hasPermission } from '@/lib/auth';

// Fetch all products with search & category filtering
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    let products = await db.find('products');

    // Filter by name, brand, SKU or slug
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.variants && p.variants.some((v: any) => v.sku.toLowerCase().includes(q)))
      );
    }

    // Filter by Category
    if (category) {
      products = products.filter((p) => p.category === category || p.subcategory === category || p.childcategory === category);
    }

    // Filter by Status
    if (status) {
      products = products.filter((p) => p.status === status);
    }

    // Sort by newest
    const sorted = products.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, products: sorted }) as Response;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

// Create new product
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    if (!hasPermission(user, 'add_product') && user.role !== 'Super Admin' && user.role !== 'Admin' && user.role !== 'Manager') {
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 }) as Response;
    }

    const body = await req.json();
    const {
      name,
      description,
      shortDescription,
      category,
      subcategory,
      childcategory,
      brand,
      tags,
      images,
      video,
      regularPrice,
      sellingPrice,
      costPrice,
      taxRate,
      stock,
      lowStockAlert,
      featured,
      trending,
      bestSeller,
      status,
      attributes,
      variants,
    } = body;

    if (!name || !category || regularPrice === undefined || sellingPrice === undefined) {
      return NextResponse.json(
        { success: false, message: 'Required fields: Name, Category, Regular Price, and Selling Price' },
        { status: 400 }
      ) as Response;
    }

    // Auto-generate unique slug
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const duplicate = await db.findOne('products', (p) => p.slug === slug);
    if (duplicate) {
      slug = `${slug}-${Math.random().toString(36).substr(2, 5)}`;
    }

    const newProduct = {
      name,
      slug,
      description: description || '',
      shortDescription: shortDescription || '',
      category,
      subcategory: subcategory || undefined,
      childcategory: childcategory || undefined,
      brand: brand || 'Generic',
      tags: tags || [],
      images: images || [],
      video: video || '',
      regularPrice: Number(regularPrice),
      sellingPrice: Number(sellingPrice),
      costPrice: Number(costPrice) || 0,
      taxRate: Number(taxRate) || 0,
      stock: Number(stock) || 0,
      lowStockAlert: Number(lowStockAlert) || 10,
      featured: !!featured,
      trending: !!trending,
      bestSeller: !!bestSeller,
      status: status || 'Active',
      attributes: attributes || { sizes: [], colors: [], fabrics: [] },
      variants: variants || [],
      createdAt: new Date().toISOString(),
    };

    const created = await db.create('products', newProduct);

    // Activity Log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Product Created',
      details: `Created product: ${name} (Slug: ${slug}, SKU count: ${variants?.length || 0})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, product: created }) as Response;
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
