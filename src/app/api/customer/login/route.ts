import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  compareCustomerPassword,
  signCustomerToken,
  getCustomerCookieConfig,
} from '@/lib/customer-auth';

// POST /api/customer/login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const customer = await db.findOne('customers', (c: any) => c.email.toLowerCase() === email.toLowerCase());

    if (!customer) {
      return NextResponse.json({ success: false, message: 'No account found with this email. Please register.' }, { status: 401 });
    }

    if (!customer.passwordHash) {
      return NextResponse.json({ success: false, message: 'This account was created during checkout. Please register to set a password.' }, { status: 401 });
    }

    if (customer.status === 'Blocked') {
      return NextResponse.json({ success: false, message: 'Your account has been suspended. Please contact support.' }, { status: 403 });
    }

    const passwordMatch = compareCustomerPassword(password, customer.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    const token = signCustomerToken({ id: customer.id, email: customer.email, name: customer.name });
    const cookieConf = getCustomerCookieConfig();

    const response = NextResponse.json({
      success: true,
      customer: { id: customer.id, email: customer.email, name: customer.name },
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
    console.error('Customer login error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
