const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// Hardcoded for testing - in production, use environment variables
const uri = 'mongodb://localhost:27017/gangio';

async function createDirectMessages() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Create direct_messages collection if it doesn't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(collection => collection.name);
    
    if (!collectionNames.includes('direct_messages')) {
      await db.createCollection('direct_messages');
      console.log('Created direct_messages collection');
    } else {
      console.log('direct_messages collection already exists');
    }
    
    // Find two non-bot users to use for direct messages
    const users = await db.collection('users')
      .find({ isBot: { $ne: true } })
      .limit(2)
      .toArray();
    
    if (users.length < 2) {
      // Create users if we don't have enough
      if (users.length === 0) {
        const userId1 = uuidv4();
        const userId2 = uuidv4();
        
        await db.collection('users').insertMany([
          {
            id: userId1,
            name: 'User One',
            discriminator: '0001',
            status: 'online',
            createdAt: new Date(),
            updatedAt: new Date(),
            friendIds: [userId2]
          },
          {
            id: userId2,
            name: 'User Two',
            discriminator: '0002',
            status: 'online',
            createdAt: new Date(),
            updatedAt: new Date(),
            friendIds: [userId1]
          }
        ]);
        
        console.log('Created two test users for direct messages');
        
        users.push({ id: userId1 });
        users.push({ id: userId2 });
      } else if (users.length === 1) {
        const userId2 = uuidv4();
        
        await db.collection('users').insertOne({
          id: userId2,
          name: 'User Two',
          discriminator: '0002',
          status: 'online',
          createdAt: new Date(),
          updatedAt: new Date(),
          friendIds: [users[0].id]
        });
        
        // Add friendship to first user
        await db.collection('users').updateOne(
          { id: users[0].id },
          { $addToSet: { friendIds: userId2 } }
        );
        
        console.log('Created second test user for direct messages');
        
        users.push({ id: userId2 });
      }
    }
    
    // Insert a sample direct message
    const message = {
      id: uuidv4(),
      content: 'Hey there! This is a test direct message.',
      senderId: users[0].id,
      recipientId: users[1].id,
      createdAt: new Date(),
      updatedAt: new Date(),
      read: false,
      edited: false
    };
    
    await db.collection('direct_messages').insertOne(message);
    console.log('Added sample direct message');
    
    // Verify the message was added
    const messages = await db.collection('direct_messages').find().toArray();
    console.log(`Direct messages count: ${messages.length}`);
    
  } catch (error) {
    console.error('Error creating direct messages:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

createDirectMessages(); 