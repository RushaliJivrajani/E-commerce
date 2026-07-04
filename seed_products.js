const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://rushalijivrajani482003:Rush4812@cluster0.ted31.mongodb.net/rush-closet?appName=Cluster0";

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema, 'products');

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fetch existing products
    const existing = await Product.find({});
    console.log(`Found ${existing.length} existing products.`);

    // If they want to see why their existing products aren't showing, let's log the first one
    if (existing.length > 0) {
      console.log('Sample existing product:', JSON.stringify(existing[0], null, 2));
    }

    const dummyProducts = [
      {
        id: 'prod_dummy_1',
        name: 'VIARO Onyx Silk Shirt',
        slug: 'viaro-onyx-silk-shirt',
        description: 'A premium oversized silk shirt crafted for modern minimalism.',
        category: 'cat_2',
        brand: 'VIARO',
        regularPrice: 4500,
        sellingPrice: 3800,
        stock: 50,
        featured: true,
        status: 'Active',
        createdAt: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=800&auto=format&fit=crop&q=80']
      },
      {
        id: 'prod_dummy_2',
        name: 'Midnight Cargo Pants',
        slug: 'midnight-cargo-pants',
        description: 'Utilitarian design meets high-end tailoring.',
        category: 'cat_2',
        brand: 'VIARO',
        regularPrice: 5500,
        sellingPrice: 4999,
        stock: 30,
        featured: true,
        status: 'Active',
        createdAt: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80']
      },
      {
        id: 'prod_dummy_3',
        name: 'Crimson Velvet Blazer',
        slug: 'crimson-velvet-blazer',
        description: 'Bold, structured, and unapologetic. The statement piece.',
        category: 'cat_1',
        brand: 'VIARO',
        regularPrice: 12000,
        sellingPrice: 8500,
        stock: 15,
        featured: true,
        status: 'Active',
        createdAt: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&auto=format&fit=crop&q=80']
      },
      {
        id: 'prod_dummy_4',
        name: 'Eclipse Seamless Top',
        slug: 'eclipse-seamless-top',
        description: 'Second-skin feel with an architectural silhouette.',
        category: 'cat_1',
        brand: 'VIARO',
        regularPrice: 2800,
        sellingPrice: 2200,
        stock: 100,
        featured: false,
        status: 'Active',
        createdAt: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&auto=format&fit=crop&q=80']
      },
      {
        id: 'prod_dummy_5',
        name: 'Mini Signature Hoodie',
        slug: 'mini-signature-hoodie',
        description: 'The VIARO experience, downsized. Maximum comfort.',
        category: 'cat_3',
        brand: 'VIARO',
        regularPrice: 3500,
        sellingPrice: 2800,
        stock: 45,
        featured: true,
        status: 'Active',
        createdAt: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1519238263530-99abad67b86b?w=800&auto=format&fit=crop&q=80']
      },
      {
        id: 'prod_dummy_6',
        name: 'Monochrome Sneakers',
        slug: 'monochrome-sneakers',
        description: 'Minimalist leather sneakers for every step.',
        category: 'cat_2',
        brand: 'VIARO',
        regularPrice: 7500,
        sellingPrice: 6200,
        stock: 25,
        featured: false,
        status: 'Active',
        createdAt: new Date().toISOString(),
        images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80']
      }
    ];

    // Insert missing dummy products
    let inserted = 0;
    for (const dp of dummyProducts) {
      const exists = await Product.findOne({ id: dp.id });
      if (!exists) {
        await Product.create(dp);
        inserted++;
      }
    }
    
    console.log(`Inserted ${inserted} new dummy premium products!`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
