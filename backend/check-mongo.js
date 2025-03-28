// This script checks if MongoDB is available before starting the application
const { MongoClient } = require('mongodb');

async function checkMongo() {
  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);
  
  try {
    console.log('Checking MongoDB connection...');
    await client.connect();
    const result = await client.db('admin').command({ ping: 1 });
    
    if (result.ok === 1) {
      console.log('MongoDB connection successful!');
      process.exit(0);
    } else {
      console.error('MongoDB ping command failed');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

checkMongo();