const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function forceUpdateAdmin() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const schema = new mongoose.Schema({ id: String }, { strict: false, collection: 'users' });
  const UserModel = mongoose.models.users || mongoose.model('users', schema);

  const salt = bcrypt.genSaltSync(10);
  const newPasswordHash = bcrypt.hashSync('Rush@123', salt);

  const result = await UserModel.updateOne(
    { email: 'admin@rushcloset.com' },
    { $set: { passwordHash: newPasswordHash } }
  );

  console.log('Update result:', result);
  console.log('Successfully forced the password update to Rush@123 for admin@rushcloset.com!');

  await mongoose.disconnect();
  process.exit(0);
}

forceUpdateAdmin().catch(console.error);
