import { NextResponse } from 'next/server';
import { CUSTOMER_COOKIE_NAME } from '@/lib/customer-auth';

// POST /api/customer/logout
export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.headers.append(
    'Set-Cookie',
    `${CUSTOMER_COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=lax`
  );
  return response;
}
