import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hasPermission } from '@/lib/auth';

// Edit category
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    if (!hasPermission(user, 'edit_category') && user.role !== 'Super Admin' && user.role !== 'Admin' && user.role !== 'Manager') {
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 }) as Response;
    }

    const { id } = await params;
    const body = await req.json();
    const { name, parentId, image, banner, seoTitle, seoDescription, status, position } = body;

    const category = await db.findOne('categories', (c) => c.id === id);
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 }) as Response;
    }

    // Check loops (cannot make category a child of itself)
    if (parentId && parentId === id) {
      return NextResponse.json({ success: false, message: 'A category cannot be its own parent' }, { status: 400 }) as Response;
    }

    const updateFields: any = {
      parentId: parentId || undefined,
      image: image ?? category.image,
      banner: banner ?? category.banner,
      seoTitle: seoTitle ?? category.seoTitle,
      seoDescription: seoDescription ?? category.seoDescription,
      status: status ?? category.status,
      position: position !== undefined ? Number(position) : category.position,
    };

    if (name && name !== category.name) {
      updateFields.name = name;
      updateFields.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      // Verify duplicate slug
      const duplicate = await db.findOne('categories', (c) => c.slug === updateFields.slug && c.id !== id);
      if (duplicate) {
        return NextResponse.json({ success: false, message: 'Another category with this name already exists' }, { status: 400 }) as Response;
      }
    }

    const updated = await db.updateOne('categories', (c) => c.id === id, updateFields);

    // Activity Log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Category Updated',
      details: `Updated category: ${category.name} (${id})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, category: updated }) as Response;
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

// Delete category
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    if (!hasPermission(user, 'delete_category') && user.role !== 'Super Admin' && user.role !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 }) as Response;
    }

    const { id } = await params;
    const category = await db.findOne('categories', (c) => c.id === id);
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 }) as Response;
    }

    // Delete the item
    await db.deleteOne('categories', (c) => c.id === id);

    // Update children: Clear their parent references
    const allCategories = await db.find('categories');
    for (const cat of allCategories) {
      if (cat.parentId === id) {
        await db.updateOne('categories', (c) => c.id === cat.id, { parentId: undefined });
      }
    }

    // Activity Log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Category Deleted',
      details: `Deleted category: ${category.name} (${id})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' }) as Response;
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
