import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, signToken, getCookieConfig } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      ) as Response; // explicit casting for compatibility
    }

    // Find the user
    const user = await db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      ) as Response;
    }

    // Check Password
    const passwordMatch = comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
      // Log failed login attempt
      await db.create('activity_logs', {
        userEmail: email,
        userName: user.name,
        role: user.role,
        action: 'Login Failed',
        details: 'Incorrect password attempt',
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });

      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      ) as Response;
    }

    // Check 2FA
    if (user.twoFactorEnabled) {
      return NextResponse.json({
        success: true,
        twoFactorRequired: true,
        userId: user.id,
        message: 'Two-factor authentication code required',
      }) as Response;
    }

    // Successful login - generate token
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Write login success log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Login Success',
      details: `Admin user logged in. Role: ${user.role}`,
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

    // Set cookie
    const cookieConf = getCookieConfig();
    response.headers.append(
      'Set-Cookie',
      `${cookieConf.name}=${token}; Max-Age=${cookieConf.maxAge}; Path=${cookieConf.path}; HttpOnly; SameSite=${cookieConf.sameSite}${cookieConf.secure ? '; Secure' : ''}`
    );

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    ) as Response;
  }
}
