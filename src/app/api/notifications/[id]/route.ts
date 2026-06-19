import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hasPermission } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    if (!hasPermission(user, 'edit_settings') && user.role !== 'Super Admin' && user.role !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 }) as Response;
    }

    const { id } = await params;
    const body = await req.json();
    const { name, type, subject, body: tplBody, isActive } = body;

    const template = await db.findOne('notification_templates', (t) => t.id === id);
    if (!template) {
      return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 }) as Response;
    }

    const updated = await db.updateOne('notification_templates', (t) => t.id === id, {
      name: name ?? template.name,
      type: type ?? template.type,
      subject: subject ?? template.subject,
      body: tplBody ?? template.body,
      isActive: isActive ?? template.isActive,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, template: updated }) as Response;
  } catch (error: any) {
    console.error('Error updating template:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    if (!hasPermission(user, 'edit_settings') && user.role !== 'Super Admin' && user.role !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 }) as Response;
    }

    const { id } = await params;
    const template = await db.findOne('notification_templates', (t) => t.id === id);
    if (!template) {
      return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 }) as Response;
    }

    await db.deleteOne('notification_templates', (t) => t.id === id);

    return NextResponse.json({ success: true, message: 'Template deleted' }) as Response;
  } catch (error: any) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
