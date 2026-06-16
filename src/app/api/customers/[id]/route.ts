import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hasPermission } from '@/lib/auth';

// Fetch single customer details and their order history
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    const { id } = await params;
    const customer = await db.findOne('customers', (c) => c.id === id);

    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 }) as Response;
    }

    // Load customer order list dynamically
    const allOrders = await db.find('orders');
    const customerOrders = allOrders.filter(
      (o) => o.customerEmail.toLowerCase() === customer.email.toLowerCase()
    );

    return NextResponse.json({
      success: true,
      customer: {
        ...customer,
        orders: customerOrders,
      },
    }) as Response;
  } catch (error: any) {
    console.error('Error fetching customer details:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}

// Update customer notes or block status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) as Response;
    }

    // Restrict blocking to Admin/Super Admin
    const { id } = await params;
    const customer = await db.findOne('customers', (c) => c.id === id);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 }) as Response;
    }

    const body = await req.json();
    const { status, notes } = body;

    const updateFields: any = {};
    if (status !== undefined) {
      // Check RBAC permission for blocking customers
      if (!hasPermission(user, 'block_customer') && user.role !== 'Super Admin' && user.role !== 'Admin') {
        return NextResponse.json({ success: false, message: 'Permission denied to block customer' }, { status: 403 }) as Response;
      }
      updateFields.status = status;
    }

    if (notes !== undefined) {
      updateFields.notes = notes;
    }

    const updated = await db.updateOne('customers', (c) => c.id === id, updateFields);

    // Activity Log
    await db.create('activity_logs', {
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      action: status === 'Blocked' ? 'Customer Blocked' : 'Customer Updated',
      details: status === 'Blocked' 
        ? `Blocked customer: ${customer.name} (${customer.email})`
        : `Updated customer notes/profile: ${customer.name}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, customer: updated }) as Response;
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 }) as Response;
  }
}
