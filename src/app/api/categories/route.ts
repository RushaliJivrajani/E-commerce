import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { getSessionUser, hasPermission } from '@/lib/auth';

// Fetch all categories
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const categories = await db.find('categories');
    // Sort by position
    const sorted = categories.sort((a, b) => a.position - b.position);
    return NextResponse.json({ success: true, categories: sorted }) as Response;
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

// Create new category
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    // Role verification
    if (!hasPermission(user, 'add_category') && user.role !== 'Super Admin' && user.role !== 'Admin' && user.role !== 'Manager') {
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 }) as Response;
    }

    const body = await req.json();
    const { name, parentId, image, banner, seoTitle, seoDescription, status, position } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Category Name is required' }, { status: 400 }) as Response;
    }

    // Auto-generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Check duplicate slug
    const existing = await db.findOne('categories', (c) => c.slug === slug);
    if (existing) {
      return NextResponse.json({ success: false, message: 'A category with this name/slug already exists' }, { status: 400 }) as Response;
    }

    const newCategory = {
      name,
      slug,
      parentId: parentId || undefined,
      image: image || '',
      banner: banner || '',
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || '',
      status: status || 'Active',
      position: Number(position) || 0,
    };

    const created = await db.create('categories', newCategory);

    // Track activity log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Category Created',
      details: `Created category: ${name} (Slug: ${slug})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, category: created }) as Response;
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
