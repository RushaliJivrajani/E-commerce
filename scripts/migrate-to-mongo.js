const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb://localhost:27017/rush-fashion';
const MOCK_DB_PATH = path.join(process.cwd(), '.mockdb.json');

async function migrate() {
  console.log('Starting migration to MongoDB...');
  
  if (!fs.existsSync(MOCK_DB_PATH)) {
    console.error('.mockdb.json not found!');
    process.exit(1);
  }

  const rawData = fs.readFileSync(MOCK_DB_PATH, 'utf-8');
  const dbData = JSON.parse(rawData);

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB: ' + MONGODB_URI);

  const collections = Object.keys(dbData);
  console.log(`Found ${collections.length} collections to migrate: ${collections.join(', ')}`);

  for (const collectionName of collections) {
    const dataArray = dbData[collectionName];
    if (Array.isArray(dataArray) && dataArray.length > 0) {
      console.log(`Migrating ${dataArray.length} items to ${collectionName}...`);
      
      const schema = new mongoose.Schema({ id: String }, { strict: false, collection: collectionName, id: false });
      const Model = mongoose.models[collectionName] || mongoose.model(collectionName, schema);
      
      // Clear existing first
      await Model.deleteMany({});
      
      // Insert new data
      await Model.insertMany(dataArray);
      console.log(`Successfully migrated ${collectionName}`);
    } else if (!Array.isArray(dataArray) && dataArray) {
       console.log(`Migrating object data to ${collectionName}...`);
       const schema = new mongoose.Schema({ id: String }, { strict: false, collection: collectionName, id: false });
       const Model = mongoose.models[collectionName] || mongoose.model(collectionName, schema);
       await Model.deleteMany({});
       await Model.create(dataArray);
       console.log(`Successfully migrated ${collectionName}`);
    } else {
      console.log(`Skipping ${collectionName} (empty or not an array)`);
    }
  }

  console.log('Migration complete!');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(console.error);
