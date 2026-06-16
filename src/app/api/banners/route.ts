import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// Get banners
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const banners = await db.find('banners');
    return NextResponse.json({ success: true, banners }) as Response;
  } catch (error: any) {
    console.error('Error in banners API:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

// Create banner
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const body = await req.json();
    const { type, image, title, buttonText, redirectLink, startDate, endDate, status } = body;

    if (!type || !image || !title) {
      return NextResponse.json({ success: false, message: 'Type, image, and title are required' }, { status: 400 }) as Response;
    }

    const newBanner = {
      type,
      image,
      title,
      buttonText: buttonText || 'Shop Now',
      redirectLink: redirectLink || '/',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: status || 'Active',
    };

    const created = await db.create('banners', newBanner);

    // Activity log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Banner Created',
      details: `Created banner: ${title} (Type: ${type})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, banner: created }) as Response;
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
