const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection URI
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function checkMembers() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check if collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Existing collections:', collectionNames);
    
    // Check server_members collection
    if (collectionNames.includes('server_members')) {
      console.log('\nChecking server_members collection:');
      const members = await db.collection('serverMembers').find({}).toArray();
      console.log('Total members:', members.length);
      console.log('Members data:', JSON.stringify(members, null, 2));
    } else {
      console.log('server_members collection doesn\'t exist');
    }
    
    // Check servers collection
    if (collectionNames.includes('servers')) {
      console.log('\nChecking servers collection:');
      const servers = await db.collection('servers').find({}).toArray();
      console.log('Total servers:', servers.length);
      console.log('Servers data:', JSON.stringify(servers, null, 2));
    } else {
      console.log('servers collection doesn\'t exist');
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

checkMembers(); 
 