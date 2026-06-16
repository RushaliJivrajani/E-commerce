import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const products = await db.find('products', (p: any) => p.status === 'Active');
    const categories = await db.find('categories', (c: any) => c.status === 'Active');

    return NextResponse.json({
      success: true,
      products,
      categories
    }) as Response;
  } catch (error: any) {
    console.error('Storefront product fetch error:', error);
    return NextResponse.json({ success: false, message: 'Server data fetch failure' }, { status: 500 }) as Response;
  }
}
