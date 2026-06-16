import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      ) as Response;
    }

    const user = await db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // For security, return success even if user isn't found, but internally skip.
      // However, for admin panel convenience, let's return a readable error or generic status.
      return NextResponse.json(
        { success: false, message: 'Admin email not found' },
        { status: 404 }
      ) as Response;
    }

    // Phase 1: Request Recovery (No OTP or password provided)
    if (!otp && !newPassword) {
      await db.create('activity_logs', {
        userEmail: user.email,
        userName: user.name,
        role: user.role,
        action: 'Forgot Password Request',
        details: 'Requested password recovery OTP',
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        message: 'A recovery code has been generated. For testing, please use code: 123456',
        step: 'otp_verification',
      }) as Response;
    }

    // Phase 2: Reset Password (OTP and New Password provided)
    if (otp !== '123456') {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP code' },
        { status: 400 }
      ) as Response;
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      ) as Response;
    }

    // Update user password hash
    const passwordHash = hashPassword(newPassword);
    await db.updateOne('users', (u) => u.id === user.id, { passwordHash });

    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Password Recovered',
      details: 'Password successfully reset via recovery OTP',
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    }) as Response;
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    ) as Response;
  }
}
