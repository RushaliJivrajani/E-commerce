import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const categories = await db.find('categories', (c: any) => c.status === 'Active');
    const settingsList = await db.getCollection('settings');
    const banners = await db.find('banners', (b: any) => b.status === 'Active');

    return NextResponse.json({
      success: true,
      categories,
      settings: settingsList,
      banners
    }) as Response;
  } catch (error: any) {
    console.error('Storefront init fetch error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 }) as Response;
  }
}
