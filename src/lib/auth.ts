import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { db, User } from './db';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'rush-fashion-super-secret-key-987654321';
const TOKEN_COOKIE_NAME = 'admin_token';

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash);
  } catch (e) {
    return false;
  }
}

export function signToken(payload: { id: string; email: string; role: string; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// Extends NextRequest to retrieve user in APIs
export async function getSessionUser(req?: NextRequest): Promise<User | null> {
  let token = '';

  if (req) {
    // 1. Try to get token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Try to get token from request cookies
    if (!token) {
      const cookie = req.cookies.get(TOKEN_COOKIE_NAME);
      if (cookie) {
        token = cookie.value;
      }
    }
  }

  // 3. Try server-side cookies if no request context (or as fallback)
  if (!token) {
    try {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(TOKEN_COOKIE_NAME);
      if (cookie) {
        token = cookie.value;
      }
    } catch (e) {
      // Cookies API might not be available outside request scope (e.g. static builds)
    }
  }

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) return null;

  // Find user in database
  const user = await db.findOne('users', (u) => u.id === decoded.id);
  return user;
}

// Get the cookie configuration
export function getCookieConfig(options: { maxAgeSeconds?: number } = {}) {
  return {
    name: TOKEN_COOKIE_NAME,
    maxAge: options.maxAgeSeconds ?? 12 * 60 * 60, // 12 hours
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  };
}

// Role Permissions Check
export function hasPermission(user: User, permission: string): boolean {
  if (user.role === 'Super Admin') return true;
  if (user.permissions.includes('all')) return true;
  return user.permissions.includes(permission);
}
