import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { db } from './db';
import { cookies } from 'next/headers';

const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || 'rush-fashion-customer-secret-key-123456';
export const CUSTOMER_COOKIE_NAME = 'customer_token';

export interface CustomerTokenPayload {
  id: string;
  email: string;
  name: string;
}

export function hashCustomerPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function compareCustomerPassword(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

export function signCustomerToken(payload: CustomerTokenPayload): string {
  return jwt.sign(payload, CUSTOMER_JWT_SECRET, { expiresIn: '7d' });
}

export function verifyCustomerToken(token: string): CustomerTokenPayload | null {
  try {
    return jwt.verify(token, CUSTOMER_JWT_SECRET) as CustomerTokenPayload;
  } catch {
    return null;
  }
}

export function getCustomerCookieConfig() {
  return {
    name: CUSTOMER_COOKIE_NAME,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  };
}

/** Get the currently logged-in customer from cookie (server-side or request context) */
export async function getCustomerSession(req?: NextRequest): Promise<any | null> {
  let token = '';

  if (req) {
    const cookie = req.cookies.get(CUSTOMER_COOKIE_NAME);
    if (cookie) token = cookie.value;
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(CUSTOMER_COOKIE_NAME);
      if (cookie) token = cookie.value;
    } catch {
      // not in request context
    }
  }

  if (!token) return null;
  const decoded = verifyCustomerToken(token);
  if (!decoded || !decoded.id) return null;

  const customer = await db.findOne('customers', (c: any) => c.id === decoded.id);
  return customer ?? null;
}
