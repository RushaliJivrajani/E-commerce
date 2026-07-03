import { NextRequest, NextResponse } from 'next/server';
import { db, User } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'Super Admin') {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, password, role, permissions } = body;

    const targetUser = await db.findOne('users', (u: User) => u.id === id);
    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Protect default super admin
    if (targetUser.email === 'admin@rushcloset.com' && user.email !== 'admin@rushcloset.com') {
       return NextResponse.json({ message: 'Cannot modify root super admin.' }, { status: 403 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      updateData.passwordHash = bcrypt.hashSync(password, salt);
    }

    if (permissions) {
      const restrictedPermissions = ['settings', 'staff', 'role_management'];
      updateData.permissions = Array.isArray(permissions) 
        ? permissions.filter(p => !restrictedPermissions.includes(p)) 
        : [];
      if (updateData.role === 'Super Admin') {
         updateData.permissions = ['all'];
      }
    }

    const updatedUser = await db.updateOne('users', (u: User) => u.id === id, updateData);
    return NextResponse.json({ message: 'User updated', user: updatedUser });
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'Super Admin') {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 403 });
    }

    const { id } = await params;
    
    const targetUser = await db.findOne('users', (u: User) => u.id === id);
    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (targetUser.email === 'admin@rushcloset.com') {
      return NextResponse.json({ message: 'Cannot delete root super admin.' }, { status: 403 });
    }

    await db.deleteOne('users', (u: User) => u.id === id);
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
