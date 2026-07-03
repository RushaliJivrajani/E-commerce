import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function run() {
  console.log('Connecting to database...');
  
  try {
    // 1. Remove all products
    console.log('Deleting all products...');
    await db.saveCollection('products', []);
    console.log('Products deleted.');

    // 2. Remove all orders
    console.log('Deleting all orders...');
    await db.saveCollection('orders', []);
    console.log('Orders deleted.');

    // 3. Remove all customers
    console.log('Deleting all customers...');
    await db.saveCollection('customers', []);
    console.log('Customers deleted.');

    // 4. Remove all reviews
    console.log('Deleting all reviews...');
    await db.saveCollection('reviews', []);
    console.log('Reviews deleted.');

    // 5. Remove all notifications
    console.log('Deleting all notifications...');
    await db.saveCollection('notification_templates', []);
    console.log('Notifications deleted.');
    
    // 6. Fix Super Admin password
    console.log('Updating super admin...');
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('PP2YGhjz8oTbdDqX', salt);
    
    await db.updateOne('users', { email: 'admin@rushcloset.com' }, { passwordHash: hash });
    console.log('Super admin password updated.');

    console.log('Client handover cleanup complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

run();
