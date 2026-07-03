import { NextRequest, NextResponse } from 'next/server';
import { db, User } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'Super Admin') {
      return NextResponse.json({ message: 'Unauthorized. Only Super Admin can view staff.' }, { status: 403 });
    }

    const users = await db.find('users');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'Super Admin') {
      return NextResponse.json({ message: 'Unauthorized. Only Super Admin can create staff.' }, { status: 403 });
    }

    const { name, email, password, role, permissions } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await db.findOne('users', (u: User) => u.email === email);
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 400 });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Filter permissions to ensure manager doesn't get Super Admin permissions
    const restrictedPermissions = ['settings', 'staff', 'role_management'];
    const safePermissions = Array.isArray(permissions) 
      ? permissions.filter(p => !restrictedPermissions.includes(p)) 
      : [];

    const newUser = await db.create('users', {
      name,
      email,
      passwordHash,
      role,
      permissions: role === 'Super Admin' ? ['all'] : safePermissions,
      twoFactorEnabled: false
    });

    return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
