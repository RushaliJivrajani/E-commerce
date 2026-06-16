import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// Fetch settings
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const settings = await db.getCollection('settings');
    return NextResponse.json({ success: true, settings }) as Response;
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

// Update settings
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    // Settings change restricted to Super Admin or Admin roles
    if (user.role !== 'Super Admin' && user.role !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Permission denied to modify store configurations' }, { status: 403 }) as Response;
    }

    const body = await req.json();
    await db.saveCollection('settings', body);

    // Activity log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Settings Updated',
      details: 'Updated global store setup, tax rates, or shipping options',
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, message: 'Settings saved successfully' }) as Response;
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
