import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// Fetch single order details
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
    const order = await db.findOne('orders', (o) => o.id === id);

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 }) as Response;
    }

    return NextResponse.json({ success: true, order }) as Response;
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

// Update order status or details
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
    const order = await db.findOne('orders', (o) => o.id === id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 }) as Response;
    }

    const body = await req.json();
    const { status, paymentStatus, details } = body;

    const updateFields: any = {};

    if (status && status !== order.status) {
      updateFields.status = status;
      
      // Auto-append tracking event to timeline
      const timelineEvent = {
        status,
        description: details || `Order status updated to ${status} by ${user.name}`,
        timestamp: new Date().toISOString(),
      };
      
      updateFields.timeline = [...order.timeline, timelineEvent];
    }

    if (paymentStatus) {
      updateFields.paymentStatus = paymentStatus;
    }

    const updated = await db.updateOne('orders', (o) => o.id === id, updateFields);

    // Activity Log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Order Updated',
      details: `Updated order ${order.orderNumber} status to ${status || order.status}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, order: updated }) as Response;
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
