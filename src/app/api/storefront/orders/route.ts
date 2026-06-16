import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID required' }, { status: 400 }) as Response;
    }

    const order = await db.findOne('orders', (o: any) => o.id === orderId);

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 444 }) as Response;
    }

    return NextResponse.json({
      success: true,
      order
    }) as Response;
  } catch (error: any) {
    console.error('Fetch storefront order details error:', error);
    return NextResponse.json({ success: false, message: 'Failed to retrieve order invoice details' }, { status: 500 }) as Response;
  }
}
