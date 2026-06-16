import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// Get coupons
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const coupons = await db.find('coupons');
    return NextResponse.json({ success: true, coupons }) as Response;
  } catch (error: any) {
    console.error('Error in coupons API:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

// Create coupon
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const body = await req.json();
    const { code, type, value, minAmount, maxDiscount, specificCategory, specificProduct, specificCustomer, usageLimit, expiryDate, status } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ success: false, message: 'Code, type, and value are required' }, { status: 400 }) as Response;
    }

    const duplicate = await db.findOne('coupons', (c) => c.code.toUpperCase() === code.toUpperCase());
    if (duplicate) {
      return NextResponse.json({ success: false, message: 'Coupon code already exists' }, { status: 400 }) as Response;
    }

    const newCoupon = {
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minAmount: Number(minAmount) || 0,
      maxDiscount: maxDiscount !== undefined ? Number(maxDiscount) : undefined,
      specificCategory: specificCategory || undefined,
      specificProduct: specificProduct || undefined,
      specificCustomer: specificCustomer || undefined,
      usageLimit: Number(usageLimit) || 100,
      usageCount: 0,
      expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: status || 'Active',
    };

    const created = await db.create('coupons', newCoupon);

    // Activity log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Coupon Created',
      details: `Created coupon: ${code} (Type: ${type}, Value: ${value})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, coupon: created }) as Response;
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
