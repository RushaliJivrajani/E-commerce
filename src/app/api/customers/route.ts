import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search') || '';

    let customers = await db.find('customers');

    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q))
      );
    }

    // Sort by totalSpent
    const sorted = customers.sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json({ success: true, customers: sorted }) as Response;
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
