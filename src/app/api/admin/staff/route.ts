import { NextResponse } from 'next/server';
import { db, User } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await db.find('users');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.findOne('users', (u: User) => u.email === email);
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 400 });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = await db.create('users', {
      name,
      email,
      passwordHash,
      role,
      permissions: role === 'Manager' ? ['add_product', 'edit_product', 'view_orders', 'edit_orders'] : [],
      twoFactorEnabled: false
    });

    return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
