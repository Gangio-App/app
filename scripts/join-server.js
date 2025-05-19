const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection URI
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function joinServer() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // 1. Create a new test user
    const userId = uuidv4();
    const newUser = {
      id: userId,
      name: 'JoinTestUser',
      discriminator: '5678',
      email: 'join_test@example.com',
      passwordHash: 'password123', // In a real app, this would be hashed
      status: 'online',
      isBot: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('users').insertOne(newUser);
    console.log('Created new test user:', userId);
    
    // 2. Find the latest server to join
    const servers = await db.collection('servers').find().sort({ createdAt: -1 }).limit(1).toArray();
    
    if (servers.length === 0) {
      console.error('No servers found to join');
      return;
    }
    
    const server = servers[0];
    console.log(`Found server to join: ${server.name} (${server.id})`);
    
    // 3. Get default role for the server
    const defaultRole = await db.collection('roles').findOne({
      serverId: server.id,
      isDefault: true
    });
    
    if (!defaultRole) {
      console.error('No default role found for server');
      return;
    }
    
    // 4. Add user to server members
    const newMember = {
      userId,
      serverId: server.id,
      roleIds: [defaultRole.id],
      joinedAt: new Date()
    };
    
    await db.collection('serverMembers').insertOne(newMember);
    console.log('Added user to server');
    
    // 5. Find or create system bot user
    let systemBotId;
    const systemBot = await db.collection('users').findOne({ 
      isBot: true, 
      name: 'System' 
    });
    
    if (systemBot) {
      systemBotId = systemBot.id;
      console.log('Using existing system bot:', systemBotId);
    } else {
      systemBotId = uuidv4();
      await db.collection('users').insertOne({
        id: systemBotId,
        name: 'System',
        discriminator: '0000',
        isBot: true,
        status: 'online',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created system bot user:', systemBotId);
    }
    
    // 6. Find the default text channel (usually "general")
    const defaultChannel = await db.collection('channels').findOne({
      serverId: server.id,
      type: 'text',
      name: 'general'
    }) || await db.collection('channels').findOne({
      serverId: server.id,
      type: 'text'
    });
    
    if (!defaultChannel) {
      console.error('No text channel found in server');
      return;
    }
    
    // 7. Create welcome message
    await db.collection('messages').insertOne({
      id: uuidv4(),
      content: `👋 **${newUser.name}** joined the server. Welcome!`,
      authorId: systemBotId,
      channelId: defaultChannel.id,
      serverId: server.id,
      attachments: [],
      mentions: [],
      isPinned: false,
      edited: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Created welcome message in channel:', defaultChannel.name);
    
    // 8. Check messages in the server
    const messages = await db.collection('messages')
      .find({ serverId: server.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    console.log('\nLatest messages in server:');
    for (const msg of messages) {
      // Get author info
      const author = await db.collection('users').findOne({ id: msg.authorId });
      const authorName = author ? author.name : 'Unknown';
      
      // Format date
      const date = new Date(msg.createdAt).toLocaleString();
      
      console.log(`[${date}] ${authorName}: ${msg.content}`);
    }
    
    console.log('\nJoin server process completed successfully!');
    
  } catch (error) {
    console.error('Error joining server:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

joinServer(); 