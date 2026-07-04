import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { getSessionUser, hasPermission } from '@/lib/auth';

// Fetch all products with search & category filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    let products = await db.find('products');

    // DUMMY DATA INJECTION FOR VIARO DEMO (If DB is empty)
    if (!products || products.length === 0) {
      products = [
        {
          id: 'prod_dummy_1',
          name: 'VIARO Onyx Silk Shirt',
          slug: 'viaro-onyx-silk-shirt',
          description: 'A premium oversized silk shirt crafted for modern minimalism.',
          category: 'cat_2', // Men
          brand: 'VIARO',
          regularPrice: 4500,
          sellingPrice: 3800,
          stock: 50,
          featured: true,
          status: 'Active',
          createdAt: new Date().toISOString(),
          images: ['https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=800&auto=format&fit=crop&q=80']
        },
        {
          id: 'prod_dummy_2',
          name: 'Midnight Cargo Pants',
          slug: 'midnight-cargo-pants',
          description: 'Utilitarian design meets high-end tailoring.',
          category: 'cat_2', // Men
          brand: 'VIARO',
          regularPrice: 5500,
          sellingPrice: 4999,
          stock: 30,
          featured: true,
          status: 'Active',
          createdAt: new Date().toISOString(),
          images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80']
        },
        {
          id: 'prod_dummy_3',
          name: 'Crimson Velvet Blazer',
          slug: 'crimson-velvet-blazer',
          description: 'Bold, structured, and unapologetic. The statement piece.',
          category: 'cat_1', // Women
          brand: 'VIARO',
          regularPrice: 12000,
          sellingPrice: 8500,
          stock: 15,
          featured: true,
          status: 'Active',
          createdAt: new Date().toISOString(),
          images: ['https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&auto=format&fit=crop&q=80']
        },
        {
          id: 'prod_dummy_4',
          name: 'Eclipse Seamless Top',
          slug: 'eclipse-seamless-top',
          description: 'Second-skin feel with an architectural silhouette.',
          category: 'cat_1', // Women
          brand: 'VIARO',
          regularPrice: 2800,
          sellingPrice: 2200,
          stock: 100,
          featured: false,
          status: 'Active',
          createdAt: new Date().toISOString(),
          images: ['https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&auto=format&fit=crop&q=80']
        },
        {
          id: 'prod_dummy_5',
          name: 'Mini Signature Hoodie',
          slug: 'mini-signature-hoodie',
          description: 'The VIARO experience, downsized. Maximum comfort.',
          category: 'cat_3', // Kids
          brand: 'VIARO',
          regularPrice: 3500,
          sellingPrice: 2800,
          stock: 45,
          featured: true,
          status: 'Active',
          createdAt: new Date().toISOString(),
          images: ['https://images.unsplash.com/photo-1519238263530-99abad67b86b?w=800&auto=format&fit=crop&q=80']
        },
        {
          id: 'prod_dummy_6',
          name: 'Monochrome Sneakers',
          slug: 'monochrome-sneakers',
          description: 'Minimalist leather sneakers for every step.',
          category: 'cat_2', // Men
          brand: 'VIARO',
          regularPrice: 7500,
          sellingPrice: 6200,
          stock: 25,
          featured: false,
          status: 'Active',
          createdAt: new Date().toISOString(),
          images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80']
        }
      ];
    }

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
      seoTitle,
      seoDescription,
      metaKeywords,
      imageAlt,
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
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      metaKeywords: metaKeywords || '',
      imageAlt: imageAlt || '',
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
