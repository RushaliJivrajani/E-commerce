const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/rush-fashion');
  const schema = new mongoose.Schema({}, { strict: false, collection: 'orders' });
  const Model = mongoose.models.orders || mongoose.model('orders', schema);
  
  const orders = await Model.find({}).lean();
  console.log("Total orders:", orders.length);
  const found = orders.find(o => o.id === 'ord_y3k9geybb');
  console.log("Order found:", !!found);
  if (!found) {
    console.log("Recent orders:", orders.slice(-5).map(o => o.id));
  } else {
    console.log("Found order:", found.id);
  }
  process.exit(0);
}
test().catch(console.error);
