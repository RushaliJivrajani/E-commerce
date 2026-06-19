import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hasPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const templates = await db.find('notification_templates');
    return NextResponse.json({ success: true, templates }) as Response;
  } catch (error: any) {
    console.error('Error fetching notification templates:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    if (!hasPermission(user, 'edit_settings') && user.role !== 'Super Admin' && user.role !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 }) as Response;
    }

    const body = await req.json();
    const { name, type, subject, body: tplBody, isActive } = body;

    const created = await db.create('notification_templates', {
      name,
      type,
      subject,
      body: tplBody,
      isActive: isActive ?? true,
      createdAt: new Date().toISOString()
    });

    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Notification Template Created',
      details: `Created template: ${name}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, template: created }) as Response;
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
