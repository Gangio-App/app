// scripts/initialize-db.js
// This script initializes the MongoDB database with necessary collections and sample data
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection URI
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function initializeDb() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check if collections exist, create them if they don't
    const existingCollections = await db.listCollections().toArray();
    const collectionNames = existingCollections.map(collection => collection.name);
    
    console.log("Existing collections:", collectionNames.join(", "));
    
    // Create collections if they don't exist
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log("Created users collection");
    }
    
    if (!collectionNames.includes('servers')) {
      await db.createCollection('servers');
      console.log("Created servers collection");
    }
    
    if (!collectionNames.includes('categories')) {
      await db.createCollection('categories');
      console.log("Created categories collection");
    }
    
    if (!collectionNames.includes('channels')) {
      await db.createCollection('channels');
      console.log("Created channels collection");
    }
    
    if (!collectionNames.includes('messages')) {
      await db.createCollection('messages');
      console.log("Created messages collection");
    }
    
    if (!collectionNames.includes('direct_messages')) {
      await db.createCollection('direct_messages');
      console.log("Created direct_messages collection");
    }
    
    if (!collectionNames.includes('roles')) {
      await db.createCollection('roles');
      console.log("Created roles collection");
    }
    
    if (!collectionNames.includes('server_members')) {
      await db.createCollection('server_members');
      console.log("Created server_members collection");
    }
    
    // Create a test user
    let userId;
    const existingUser = await db.collection('users').findOne({ name: 'Test User' });
    
    if (existingUser) {
      userId = existingUser.id;
      console.log('Using existing test user:', userId);
    } else {
      userId = uuidv4();
      await db.collection('users').insertOne({
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        discriminator: '0001',
        avatar: null,
        status: 'online',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created test user:', userId);
    }
    
    // Create system bot user if it doesn't exist
    let systemBotId;
    const existingBot = await db.collection('users').findOne({ 
      isBot: true, 
      name: "System" 
    });
    
    if (existingBot) {
      systemBotId = existingBot.id;
      console.log('Using existing system bot user:', systemBotId);
    } else {
      systemBotId = uuidv4();
      await db.collection('users').insertOne({
        id: systemBotId,
        name: "System",
        discriminator: "0000",
        isBot: true,
        status: "online",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created system bot user:', systemBotId);
    }
    
    // Create a new test server
    const serverName = `Test Server ${new Date().toISOString().split('T')[0]}`;
    const serverId = uuidv4();
    
    await db.collection('servers').insertOne({
      id: serverId,
      name: serverName,
      ownerId: userId,
      inviteCode: uuidv4().substring(0, 8),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created test server:', serverId);
    
    // Create categories for the new server
    const generalCategoryId = uuidv4();
    await db.collection('categories').insertOne({
      id: generalCategoryId,
      name: 'GENERAL',
      serverId: serverId,
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created category for the new server');
    
    // Create channels for the new server
    const textChannelId = uuidv4();
    await db.collection('channels').insertMany([
      {
        id: textChannelId,
        name: 'general',
        type: 'text',
        serverId: serverId,
        categoryId: generalCategoryId,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'welcome',
        type: 'text',
        serverId: serverId,
        categoryId: generalCategoryId,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Voice Chat',
        type: 'voice',
        serverId: serverId,
        categoryId: generalCategoryId,
        position: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log('Created channels for the new server');
    
    // Create roles for the new server
    const everyoneRoleId = uuidv4();
    await db.collection('roles').insertMany([
      {
        id: everyoneRoleId,
        name: '@everyone',
        color: '#99AAB5',
        serverId: serverId,
        permissions: ['READ_MESSAGES', 'SEND_MESSAGES', 'CONNECT'],
        position: 0,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Admin',
        color: '#F04747',
        serverId: serverId,
        permissions: ['ADMINISTRATOR'],
        position: 1,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log('Created roles for the new server');
    
    // Add the user to the new server
    await db.collection('serverMembers').insertOne({
      userId: userId,
      serverId: serverId,
      roleIds: [everyoneRoleId],
      joinedAt: new Date()
    });
    console.log('Added user to the new server');
    
    // Create welcome messages
    await db.collection('messages').insertOne({
      id: uuidv4(),
      content: `👋 Welcome to **${serverName}**! This server was just created.`,
      authorId: systemBotId,
      channelId: textChannelId,
      serverId: serverId,
      attachments: [],
      mentions: [],
      isPinned: false,
      edited: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await db.collection('messages').insertOne({
      id: uuidv4(),
      content: "✨ **Server Tips:**\n• Invite your friends using the server settings\n• Create more channels for different topics\n• Set up roles to organize your community",
      authorId: systemBotId,
      channelId: textChannelId,
      serverId: serverId,
      attachments: [],
      mentions: [],
      isPinned: false,
      edited: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created welcome messages');
    
    // Update the server with the default channel ID
    await db.collection('servers').updateOne(
      { id: serverId },
      { $set: { defaultChannelId: textChannelId } }
    );
    console.log('Updated server with default channel ID');
    
    // Create a sample direct message if we have two users
    const secondUser = await db.collection('users').findOne({ 
      id: { $ne: userId },
      isBot: { $ne: true }
    });
    
    if (secondUser) {
      // Make them friends
      await db.collection('users').updateOne(
        { id: userId },
        { $addToSet: { friendIds: secondUser.id } }
      );
      
      await db.collection('users').updateOne(
        { id: secondUser.id },
        { $addToSet: { friendIds: userId } }
      );
      
      // Add a sample direct message
      await db.collection('direct_messages').insertOne({
        id: uuidv4(),
        content: "Hey there! This is a test direct message.",
        senderId: userId,
        recipientId: secondUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        read: false,
        edited: false
      });
      
      console.log('Created friendship and sample direct message between users');
    }
    
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

initializeDb(); 