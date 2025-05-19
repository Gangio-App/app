const { MongoClient } = require('mongodb');

async function checkMessages() {
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
    
    // Get all servers
    const servers = await db.collection('servers').find().toArray();
    
    for (const server of servers) {
      console.log(`\n=== Server: ${server.name} (ID: ${server.id}) ===`);
      
      // Get channels for this server
      const channels = await db.collection('channels').find({ 
        serverId: server.id,
        type: 'text'
      }).toArray();
      
      for (const channel of channels) {
        console.log(`\nChannel: ${channel.name} (ID: ${channel.id})`);
        
        // Get messages for this channel
        const messages = await db.collection('messages').find({ 
          channelId: channel.id 
        }).sort({ createdAt: 1 }).toArray();
        
        console.log(`Found ${messages.length} messages in channel ${channel.name}`);
        
        for (const message of messages) {
          // Get the author of the message
          const author = await db.collection('users').findOne({ id: message.authorId });
          const authorName = author ? author.name : 'Unknown';
          
          console.log(`\n[${new Date(message.createdAt).toLocaleString()}] ${authorName}:`);
          console.log(message.content);
        }
      }
      
      console.log('\n-----------------------------------\n');
    }
    
  } catch (error) {
    console.error('Error checking messages:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

checkMessages(); 