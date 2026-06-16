import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customer-auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const customer = await getCustomerSession(req);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
    }

    const order = await db.findById('orders', orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if (order.customerEmail?.toLowerCase() !== customer.email?.toLowerCase()) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const unCancellableStatuses = ['Out For Delivery', 'Delivered', 'Cancelled', 'Returned'];
    if (unCancellableStatuses.includes(order.status)) {
      return NextResponse.json({ success: false, message: `Order cannot be cancelled because it is already ${order.status}` }, { status: 400 });
    }

    order.status = 'Cancelled';
    order.timeline = order.timeline || [];
    order.timeline.push({
      status: 'Cancelled',
      description: 'Order was cancelled by the customer.',
      timestamp: new Date().toISOString(),
    });

    await db.update('orders', orderId, order);

    return NextResponse.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) {
    console.error('Cancel order error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
