import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customer-auth';
import { db } from '@/lib/db';

// GET /api/customer/orders
export async function GET(req: NextRequest) {
  try {
    const customer = await getCustomerSession(req);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const allOrders = await db.find('orders');
    const customerOrders = allOrders
      .filter((o: any) => o.customerEmail?.toLowerCase() === customer.email?.toLowerCase())
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, orders: customerOrders });
  } catch (err) {
    console.error('Customer orders error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
