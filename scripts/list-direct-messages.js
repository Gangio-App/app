const { MongoClient } = require('mongodb');

// Hardcoded for testing - in production, use environment variables
const uri = 'mongodb://localhost:27017/gangio';

async function listDirectMessages() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // List direct messages
    const messages = await db.collection('direct_messages').find().toArray();
    
    console.log('\nDirect messages in database:');
    if (messages.length === 0) {
      console.log('No direct messages found');
    } else {
      for (const message of messages) {
        // Get sender and recipient names
        const sender = await db.collection('users').findOne({ id: message.senderId });
        const recipient = await db.collection('users').findOne({ id: message.recipientId });
        
        const senderName = sender ? sender.name : 'Unknown User';
        const recipientName = recipient ? recipient.name : 'Unknown User';
        
        console.log(`ID: ${message.id}`);
        console.log(`From: ${senderName} (${message.senderId})`);
        console.log(`To: ${recipientName} (${message.recipientId})`);
        console.log(`Content: ${message.content}`);
        console.log(`Created: ${message.createdAt}`);
        console.log(`Read: ${message.read ? 'Yes' : 'No'}`);
        console.log('-'.repeat(50));
      }
    }
  } catch (error) {
    console.error('Error listing direct messages:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

listDirectMessages(); 