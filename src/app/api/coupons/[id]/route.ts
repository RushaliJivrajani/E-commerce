import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// Update coupon
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
    const coupon = await db.findOne('coupons', (c) => c.id === id);
    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 }) as Response;
    }

    const body = await req.json();
    const updated = await db.updateOne('coupons', (c) => c.id === id, body);

    // Activity log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Coupon Updated',
      details: `Updated coupon: ${coupon.code} (${id})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, coupon: updated }) as Response;
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

// Delete coupon
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
    const coupon = await db.findOne('coupons', (c) => c.id === id);
    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 }) as Response;
    }

    await db.deleteOne('coupons', (c) => c.id === id);

    // Activity log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Coupon Deleted',
      details: `Deleted coupon: ${coupon.code} (${id})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' }) as Response;
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
