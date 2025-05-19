const { MongoClient } = require('mongodb');

// Hardcoded for testing - in production, use environment variables
const uri = 'mongodb://localhost:27017/gangio';

async function listCollections() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // List all collections
    const collections = await db.listCollections().toArray();
    
    console.log('\nCollections in database:');
    if (collections.length === 0) {
      console.log('No collections found');
    } else {
      collections.forEach((collection, index) => {
        console.log(`${index + 1}. ${collection.name}`);
      });
    }
  } catch (error) {
    console.error('Error listing collections:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

listCollections(); 