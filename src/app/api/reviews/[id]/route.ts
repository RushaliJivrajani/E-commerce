import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// Update review status or reply
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
    const review = await db.findOne('reviews', (r) => r.id === id);
    if (!review) {
      return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 }) as Response;
    }

    const body = await req.json();
    const { status, reply } = body;

    const updated = await db.updateOne('reviews', (r) => r.id === id, {
      status: status ?? review.status,
      reply: reply !== undefined ? reply : review.reply,
    });

    // Activity log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Review Moderated',
      details: `Moderated review for: ${review.productName} (Status: ${status || review.status})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, review: updated }) as Response;
  } catch (error: any) {
    console.error('Error moderating review:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

// Delete review
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
    const review = await db.findOne('reviews', (r) => r.id === id);
    if (!review) {
      return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 }) as Response;
    }

    await db.deleteOne('reviews', (r) => r.id === id);

    // Activity log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Review Deleted',
      details: `Deleted review from: ${review.customerName} on ${review.productName}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, message: 'Review deleted successfully' }) as Response;
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
