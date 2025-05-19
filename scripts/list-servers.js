const { MongoClient } = require('mongodb');

async function listServers() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const servers = await db.collection('servers').find().toArray();
    
    console.log('\nServers in database:');
    servers.forEach(server => {
      console.log(`- ${server.name} (ID: ${server._id}, Default Channel: ${server.defaultChannelId || 'none'})`);
    });
    
  } catch (error) {
    console.error('Error listing servers:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

listServers(); 