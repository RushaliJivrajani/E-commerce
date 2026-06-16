import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      ) as Response;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
      },
    }) as Response;
  } catch (error: any) {
    console.error('Error in auth profile check:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    ) as Response;
  }
}
