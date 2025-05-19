const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection URI
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function checkServers() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // List all servers
    const servers = await db.collection('servers').find().toArray();
    console.log('\nServers in database:');
    for (const server of servers) {
      console.log(`- ${server.name} (ID: ${server.id}, Default Channel: ${server.defaultChannelId})`);
    }
    
    // Check the latest server's welcome messages
    if (servers.length > 0) {
      // Sort by creation date descending to get the newest server
      servers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const latestServer = servers[0];
      
      console.log(`\nChecking messages for latest server: ${latestServer.name} (${latestServer.id})`);
      
      const messages = await db.collection('messages')
        .find({ serverId: latestServer.id })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();
      
      console.log(`\nLatest messages in server (${messages.length} found):`);
      
      for (const msg of messages) {
        // Get author info
        const author = await db.collection('users').findOne({ id: msg.authorId });
        const authorName = author ? author.name : 'Unknown';
        
        // Format date
        const date = new Date(msg.createdAt).toLocaleString();
        
        console.log(`[${date}] ${authorName}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
      }
    }
    
  } catch (error) {
    console.error('Error checking servers:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkServers(); 