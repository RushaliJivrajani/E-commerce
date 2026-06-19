import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hasPermission } from '@/lib/auth';

// Fetch single product details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const { id } = await params;
    const product = await db.findOne('products', (p) => p.id === id);

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 }) as Response;
    }

    return NextResponse.json({ success: true, product }) as Response;
  } catch (error: any) {
    console.error('Error fetching product details:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

// Edit product
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    if (!hasPermission(user, 'edit_product') && user.role !== 'Super Admin' && user.role !== 'Admin' && user.role !== 'Manager') {
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 }) as Response;
    }

    const { id } = await params;
    const product = await db.findOne('products', (p) => p.id === id);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 }) as Response;
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

    const updateFields: any = {
      description: description ?? product.description,
      shortDescription: shortDescription ?? product.shortDescription,
      category: category ?? product.category,
      subcategory: subcategory !== undefined ? subcategory : product.subcategory,
      childcategory: childcategory !== undefined ? childcategory : product.childcategory,
      brand: brand ?? product.brand,
      tags: tags ?? product.tags,
      images: images ?? product.images,
      video: video !== undefined ? video : product.video,
      regularPrice: regularPrice !== undefined ? Number(regularPrice) : product.regularPrice,
      sellingPrice: sellingPrice !== undefined ? Number(sellingPrice) : product.sellingPrice,
      costPrice: costPrice !== undefined ? Number(costPrice) : product.costPrice,
      taxRate: taxRate !== undefined ? Number(taxRate) : product.taxRate,
      stock: stock !== undefined ? Number(stock) : product.stock,
      lowStockAlert: lowStockAlert !== undefined ? Number(lowStockAlert) : product.lowStockAlert,
      featured: featured !== undefined ? !!featured : product.featured,
      trending: trending !== undefined ? !!trending : product.trending,
      bestSeller: bestSeller !== undefined ? !!bestSeller : product.bestSeller,
      status: status ?? product.status,
      seoTitle: seoTitle !== undefined ? seoTitle : product.seoTitle,
      seoDescription: seoDescription !== undefined ? seoDescription : product.seoDescription,
      metaKeywords: metaKeywords !== undefined ? metaKeywords : product.metaKeywords,
      imageAlt: imageAlt !== undefined ? imageAlt : product.imageAlt,
      attributes: attributes ?? product.attributes,
      variants: variants ?? product.variants,
    };

    if (name && name !== product.name) {
      updateFields.name = name;
      let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const duplicate = await db.findOne('products', (p) => p.slug === slug && p.id !== id);
      if (duplicate) {
        slug = `${slug}-${Math.random().toString(36).substr(2, 5)}`;
      }
      updateFields.slug = slug;
    }

    const updated = await db.updateOne('products', (p) => p.id === id, updateFields);

    // Activity Log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Product Updated',
      details: `Updated product: ${product.name} (ID: ${id})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, product: updated }) as Response;
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

// Delete product
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    if (!hasPermission(user, 'delete_product') && user.role !== 'Super Admin' && user.role !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 }) as Response;
    }

    const { id } = await params;
    const product = await db.findOne('products', (p) => p.id === id);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 }) as Response;
    }

    await db.deleteOne('products', (p) => p.id === id);

    // Activity Log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Product Deleted',
      details: `Deleted product: ${product.name} (SKU: ${id})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' }) as Response;
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
