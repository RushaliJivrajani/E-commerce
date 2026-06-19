require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const { connectMongoDB } = require('./src/lib/db.js');
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/rush-fashion');
  const schema = new mongoose.Schema({}, { strict: false, collection: 'products' });
  const Model = mongoose.models.products || mongoose.model('products', schema);
  
  const products = await Model.find({}).lean();
  console.log("Products count:", products.length);
  if (products.length > 0) {
    console.log("First product:", JSON.stringify(products[0], null, 2));
  }
  process.exit(0);
}
test().catch(console.error);
