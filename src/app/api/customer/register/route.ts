import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  hashCustomerPassword,
  compareCustomerPassword,
  signCustomerToken,
  getCustomerCookieConfig,
} from '@/lib/customer-auth';

// POST /api/customer/register
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Name, email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if customer already exists
    const existing = await db.findOne('customers', (c: any) => c.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json({ success: false, message: 'An account with this email already exists. Please log in.' }, { status: 409 });
    }

    const passwordHash = hashCustomerPassword(password);

    const newCustomer = await db.create('customers', {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      passwordHash,
      addressList: [],
      totalSpent: 0,
      ordersCount: 0,
      wishlistCount: 0,
      status: 'Active',
    });

    // Generate token and set cookie
    const token = signCustomerToken({ id: newCustomer.id, email: newCustomer.email, name: newCustomer.name });
    const cookieConf = getCustomerCookieConfig();

    const response = NextResponse.json({
      success: true,
      customer: { id: newCustomer.id, email: newCustomer.email, name: newCustomer.name },
    });

    response.cookies.set({
      name: cookieConf.name,
      value: token,
      maxAge: cookieConf.maxAge,
      path: cookieConf.path,
      httpOnly: cookieConf.httpOnly,
      secure: cookieConf.secure,
      sameSite: cookieConf.sameSite,
    });

    return response;
  } catch (err: any) {
    console.error('Customer register error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
