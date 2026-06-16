import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    let orders = await db.find('orders');

    // Filter by status tab
    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    // Search by orderNumber, email, or customerName
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
      );
    }

    // Sort by newest
    const sorted = orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, orders: sorted }) as Response;
  } catch (error: any) {
    console.error('Error in orders API:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
