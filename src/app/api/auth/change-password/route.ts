import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hashPassword, comparePassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized session' },
        { status: 401 }
      ) as Response;
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current and new passwords are required' },
        { status: 400 }
      ) as Response;
    }

    // Check current password
    if (!comparePassword(currentPassword, user.passwordHash)) {
      return NextResponse.json(
        { success: false, message: 'Incorrect current password' },
        { status: 400 }
      ) as Response;
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters' },
        { status: 400 }
      ) as Response;
    }

    // Save hashed password
    const newHash = hashPassword(newPassword);
    await db.updateOne('users', (u) => u.id === user.id, { passwordHash: newHash });

    // Log password change
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: 'Password Changed',
      details: 'User changed their password from the account dashboard',
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    }) as Response;
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    ) as Response;
  }
}
