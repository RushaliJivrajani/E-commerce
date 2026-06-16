import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCookieConfig, getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    
    if (user) {
      // Log logout event
      await db.create('activity_logs', {
        userEmail: user.email,
        userName: user.name,
        role: user.role,
        action: 'Logout',
        details: 'Admin user logged out manually',
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    }) as Response;

    const cookieConf = getCookieConfig();
    
    // Invalidate cookie by setting max age to 0
    response.headers.append(
      'Set-Cookie',
      `${cookieConf.name}=; Max-Age=0; Path=${cookieConf.path}; HttpOnly; SameSite=${cookieConf.sameSite}${cookieConf.secure ? '; Secure' : ''}`
    );

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    ) as Response;
  }
}
