import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const returns = await db.find('return_requests');
    const sorted = returns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, returns: sorted }) as Response;
  } catch (error: any) {
    console.error('Error fetching returns:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
