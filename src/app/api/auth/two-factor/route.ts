import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken, getCookieConfig } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { userId, code } = await req.json();

    if (!userId || !code) {
      return NextResponse.json(
        { success: false, message: 'User ID and verification code are required' },
        { status: 400 }
      ) as Response;
    }

    const user = await db.findOne('users', (u) => u.id === userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      ) as Response;
    }

    // In a production system, we would verify the code against a TOTP secret.
    // For our enterprise simulation, we accept '555555' as the valid 2FA code.
    if (code !== '555555') {
      await db.create('activity_logs', {
        userEmail: user.email,
        userName: user.name,
        role: user.role,
        action: '2FA Failed',
        details: 'Incorrect 2FA code entered',
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });

      return NextResponse.json(
        { success: false, message: 'Invalid 2FA code' },
        { status: 400 }
      ) as Response;
    }

    // Sign JWT
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Log success
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Login 2FA Success',
      details: 'Logged in successfully via 2FA',
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      },
    }) as Response;

    const cookieConf = getCookieConfig();
    response.headers.append(
      'Set-Cookie',
      `${cookieConf.name}=${token}; Max-Age=${cookieConf.maxAge}; Path=${cookieConf.path}; HttpOnly; SameSite=${cookieConf.sameSite}${cookieConf.secure ? '; Secure' : ''}`
    );

    return response;
  } catch (error: any) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    ) as Response;
  }
}
