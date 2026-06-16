import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const { id } = await params;
    const contentObj = await db.findOne('website_content', (w) => w.id === id);
    if (!contentObj) {
      return NextResponse.json({ success: false, message: 'Content not found' }, { status: 404 }) as Response;
    }

    const body = await req.json();
    const { title, content } = body;

    const updated = await db.updateOne('website_content', (w) => w.id === id, {
      title: title ?? contentObj.title,
      content: content ?? contentObj.content,
      lastUpdated: new Date().toISOString(),
    });

    // Activity log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Content Page Updated',
      details: `Updated page: ${contentObj.title} (${id})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, content: updated }) as Response;
  } catch (error: any) {
    console.error('Error updating content page:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
