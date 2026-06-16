import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, productName, rating, comment, customerName } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 }) as Response;
    }

    const newReview = await db.create('reviews', {
      productId,
      productName,
      customerName: customerName || 'Anonymous Customer',
      rating: Number(rating),
      comment,
      status: 'Approved', // Auto-approved for fast testing storefront features
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview
    }) as Response;
  } catch (error: any) {
    console.error('Submit review error:', error);
    return NextResponse.json({ success: false, message: 'Server error processing review feedback' }, { status: 500 }) as Response;
  }
}
