import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json({ success: false, message: 'Coupon code required' }, { status: 400 }) as Response;
    }

    const coupon = await db.findOne('coupons', (c: any) => c.code.toUpperCase() === code.toUpperCase() && c.status === 'Active');

    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Invalid or inactive coupon code' }) as Response;
    }

    // Check expiry
    const today = new Date();
    const expiry = new Date(coupon.expiryDate);
    if (expiry < today) {
      return NextResponse.json({ success: false, message: 'This coupon code has expired' }) as Response;
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, message: 'This coupon usage limit has been reached' }) as Response;
    }

    // Check minimum order amount
    if (subtotal < coupon.minAmount) {
      return NextResponse.json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minAmount} is required to use this coupon`
      }) as Response;
    }

    // Calculate discount estimate
    let discount = 0;
    if (coupon.type === 'Percentage') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'Fixed') {
      discount = coupon.value;
    } else if (coupon.type === 'Free Shipping') {
      discount = 0; // Handled as shipping waiver in checkout logic
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        maxDiscount: coupon.maxDiscount,
        minAmount: coupon.minAmount,
        discount
      }
    }) as Response;
  } catch (error: any) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ success: false, message: 'Server failure during coupon validation' }, { status: 500 }) as Response;
  }
}
