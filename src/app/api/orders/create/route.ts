import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      paymentDetails,
      products: orderProducts,
      couponCode,
      shippingCharges,
      taxAmount,
      discountAmount,
      totalAmount
    } = body;

    // 1. Validation Checks
    if (!customerName || !customerEmail || !shippingAddress || !orderProducts || orderProducts.length === 0) {
      return NextResponse.json({ success: false, message: 'Missing billing fields or empty cart' }, { status: 400 }) as Response;
    }

    // Load DB Collections
    const products = await db.find('products');
    const coupons = await db.find('coupons');
    const customers = await db.find('customers');
    const orders = await db.find('orders');

    // 2. Stock Verification & Variant Matrix Checks
    for (const item of orderProducts) {
      let dbProdIndex = products.findIndex((p: any) => String(p.id) === String(item.productId));
      
      // Fallback for corrupted local carts
      if (dbProdIndex === -1) {
        dbProdIndex = products.findIndex((p: any) => p.name === item.name);
        // If we found it by name, update the item's productId for consistency
        if (dbProdIndex > -1) {
          item.productId = products[dbProdIndex].id;
        }
      }

      if (dbProdIndex === -1) {
        return NextResponse.json({ success: false, message: `Product ${item.name} not found in database catalog` }) as Response;
      }

      const dbProd = products[dbProdIndex];

      // If item has variants
      if (dbProd.variants && dbProd.variants.length > 0) {
        const variantIndex = dbProd.variants.findIndex((v: any) => v.sku === item.sku);
        if (variantIndex === -1) {
          return NextResponse.json({ success: false, message: `Product variant SKU ${item.sku} not found for ${item.name}` }) as Response;
        }

        const variant = dbProd.variants[variantIndex];
        if (variant.stock < item.quantity) {
          return NextResponse.json({
            success: false,
            message: `Stock deficiency: Only ${variant.stock} items left for ${item.name} (${item.variantInfo})`
          }) as Response;
        }
      } else {
        // Base product stock check
        if (dbProd.stock < item.quantity) {
          return NextResponse.json({
            success: false,
            message: `Stock deficiency: Only ${dbProd.stock} items left for ${item.name}`
          }) as Response;
        }
      }
    }

    // 3. Deduct Stock Levels in Database
    const updatedProducts = products.map((prod: any) => {
      // Find items in order mapping to this product
      const matchingItems = orderProducts.filter((item: any) => item.productId === prod.id);
      if (matchingItems.length === 0) return prod;

      let updatedProd = { ...prod };
      matchingItems.forEach((item: any) => {
        if (updatedProd.variants && updatedProd.variants.length > 0) {
          // Deduct variant stock
          updatedProd.variants = updatedProd.variants.map((v: any) => {
            if (v.sku === item.sku) {
              return { ...v, stock: Math.max(0, v.stock - item.quantity) };
            }
            return v;
          });
          // Also update base stock sum
          updatedProd.stock = updatedProd.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
        } else {
          // Deduct base product stock
          updatedProd.stock = Math.max(0, updatedProd.stock - item.quantity);
        }
      });
      return updatedProd;
    });

    await db.saveCollection('products', updatedProducts);

    // 4. Update Coupon Usage if coupon applied
    if (couponCode) {
      const updatedCoupons = coupons.map((c: any) => {
        if (c.code.toUpperCase() === couponCode.toUpperCase()) {
          return { ...c, usageCount: (c.usageCount || 0) + 1 };
        }
        return c;
      });
      await db.saveCollection('coupons', updatedCoupons);
    }

    // 5. Update or Create Customer Profile
    const existingCustIndex = customers.findIndex((c: any) => c.email.toLowerCase() === customerEmail.toLowerCase());
    const customerId = existingCustIndex > -1 ? customers[existingCustIndex].id : `cust_${Math.random().toString(36).substr(2, 9)}`;

    if (existingCustIndex > -1) {
      // Update existing customer
      customers[existingCustIndex] = {
        ...customers[existingCustIndex],
        totalSpent: (customers[existingCustIndex].totalSpent || 0) + totalAmount,
        ordersCount: (customers[existingCustIndex].ordersCount || 0) + 1,
        phone: shippingAddress.phone || customers[existingCustIndex].phone
      };
    } else {
      // Create new customer profile
      customers.push({
        id: customerId,
        name: customerName,
        email: customerEmail,
        phone: shippingAddress.phone,
        addressList: [{
          addressLine: shippingAddress.addressLine,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country
        }],
        totalSpent: totalAmount,
        ordersCount: 1,
        wishlistCount: 0,
        status: 'Active',
        createdAt: new Date().toISOString()
      });
    }
    await db.saveCollection('customers', customers);

    // 6. Create final Order record
    const nextOrderNum = `RF-2026-${String(orders.length + 1).padStart(4, '0')}`;
    const orderId = `ord_${Math.random().toString(36).substr(2, 9)}`;
    const newOrder = {
      id: orderId,
      orderNumber: nextOrderNum,
      customerName,
      customerEmail,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      paymentDetails: paymentDetails || {},
      shippingCharges,
      taxAmount,
      discountAmount,
      totalAmount,
      status: 'Placed',
      timeline: [
        {
          status: 'Placed',
          description: 'Order successfully created via storefront checkout portal',
          timestamp: new Date().toISOString()
        }
      ],
      products: orderProducts,
      createdAt: new Date().toISOString()
    };

    await db.create('orders', newOrder);

    // 7. Log Activity
    await db.create('activity_logs', {
      id: `log_${Math.random().toString(36).substr(2, 9)}`,
      userEmail: 'customer@rushfashion.com',
      userName: customerName,
      role: 'Storefront User',
      action: 'Storefront Checkout',
      details: `Customer ${customerName} successfully placed order ${nextOrderNum} totaling ₹${totalAmount} via ${paymentMethod}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      orderId,
      orderNumber: nextOrderNum
    }) as Response;
  } catch (error: any) {
    console.error('Create storefront order error:', error);
    return NextResponse.json({ success: false, message: 'Server failed to process order creation request' }, { status: 500 }) as Response;
  }
}
