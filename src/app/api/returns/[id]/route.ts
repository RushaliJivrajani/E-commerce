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

    if (!hasPermission(user, 'edit_order') && user.role !== 'Super Admin' && user.role !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 }) as Response;
    }

    const { id } = await params;
    const body = await req.json();
    const { status, resolution, adminComments } = body;

    const returnRequest = await db.findOne('return_requests', (r) => r.id === id);
    if (!returnRequest) {
      return NextResponse.json({ success: false, message: 'Return request not found' }, { status: 404 }) as Response;
    }

    const updated = await db.updateOne('return_requests', (r) => r.id === id, {
      status: status ?? returnRequest.status,
      resolution: resolution ?? returnRequest.resolution,
      adminComments: adminComments ?? returnRequest.adminComments,
      updatedAt: new Date().toISOString()
    });

    // If status updated to Approved, we might want to also add a log or trigger refund
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Return Request Updated',
      details: `Updated return request ${id} to status ${status}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, returnRequest: updated }) as Response;
  } catch (error: any) {
    console.error('Error updating return request:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
