import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    // Restrict logs to Super Admin
    if (user.role !== 'Super Admin') {
      return NextResponse.json({ success: false, message: 'Permission denied to access system activity logs' }, { status: 403 }) as Response;
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search') || '';

    let logs = await db.find('activity_logs');

    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.userEmail.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.details && l.details.toLowerCase().includes(q))
      );
    }

    // Sort by newest logs
    const sorted = logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ success: true, logs: sorted }) as Response;
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
