import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customer-auth';

// GET /api/customer/me
export async function GET(req: NextRequest) {
  try {
    const customer = await getCustomerSession(req);
    if (!customer) {
      return NextResponse.json({ success: false, customer: null }, { status: 401 });
    }
    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        addressList: customer.addressList,
        totalSpent: customer.totalSpent,
        ordersCount: customer.ordersCount,
        createdAt: customer.createdAt,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, customer: null }, { status: 500 });
  }
}
