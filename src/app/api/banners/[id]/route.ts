import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// Update banner
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const { id } = await params;
    const banner = await db.findOne('banners', (b) => b.id === id);
    if (!banner) {
      return NextResponse.json({ success: false, message: 'Banner not found' }, { status: 404 }) as Response;
    }

    const body = await req.json();
    const updated = await db.updateOne('banners', (b) => b.id === id, body);

    // Activity log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Banner Updated',
      details: `Updated banner: ${banner.title} (${id})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, banner: updated }) as Response;
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

// Delete banner
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const { id } = await params;
    const banner = await db.findOne('banners', (b) => b.id === id);
    if (!banner) {
      return NextResponse.json({ success: false, message: 'Banner not found' }, { status: 404 }) as Response;
    }

    await db.deleteOne('banners', (b) => b.id === id);

    // Activity log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Banner Deleted',
      details: `Deleted banner: ${banner.title} (${id})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, message: 'Banner deleted successfully' }) as Response;
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
