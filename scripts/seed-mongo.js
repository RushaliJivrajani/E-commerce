const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set in .env");
  process.exit(1);
}

const getModel = (collectionName) => {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  const schema = new mongoose.Schema({ id: String }, { 
    strict: false, 
    collection: collectionName,
    id: false
  });
  return mongoose.model(collectionName, schema);
};

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const salt = bcrypt.genSaltSync(10);
  const superAdminPasswordHash = bcrypt.hashSync('Rush@123', salt);

  const defaultData = {
    users: [
      {
        id: 'usr_1',
        email: 'admin@rushcloset.com',
        name: 'Super Admin',
        passwordHash: superAdminPasswordHash,
        role: 'Super Admin',
        permissions: ['all'],
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
      }
    ],
    settings: {
      storeName: 'Rush Closet',
      logo: 'https://placehold.co/150x50/slate/white?text=RUSH+CLOSET',
      favicon: 'https://placehold.co/32x32/slate/white?text=RF',
      contactEmail: 'rushcloset@gmail.com',
      contactPhone: '+91 79 4001 0203',
      address: '501-505, Titanium Square, Thaltej, Ahmedabad, Gujarat, India',
      socialLinks: {
        facebook: 'https://facebook.com/rushcloset',
        instagram: 'https://instagram.com/rushcloset'
      },
      currency: 'INR',
      currencySymbol: '₹',
      taxRateDefault: 18,
      shippingZones: [
        { zoneName: 'Gujarat Local', regions: ['Gujarat'], charge: 50, freeShippingMin: 999, deliveryDays: 2 },
        { zoneName: 'Domestic Standard', regions: ['All States Except Gujarat', 'Other States'], charge: 100, freeShippingMin: 1499, deliveryDays: 5 }
      ]
    },
    notification_templates: [
      {
        id: 'notif_1',
        type: 'Email',
        event: 'Order Placed',
        subject: 'Order Confirmation - Rush Closet',
        body: 'Hello {{customerName}}, thank you for placing your order {{orderId}} with us!',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ]
  };

  for (const collectionName of Object.keys(defaultData)) {
    const dataArray = defaultData[collectionName];
    const Model = getModel(collectionName);
    
    // Check if empty
    const count = await Model.countDocuments();
    if (count === 0) {
      console.log(`Seeding ${collectionName}...`);
      if (Array.isArray(dataArray)) {
        await Model.insertMany(dataArray);
      } else {
        await Model.create(dataArray);
      }
    } else {
      console.log(`${collectionName} already has data. Skipping.`);
    }
  }

  console.log('Database is perfectly seeded!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
