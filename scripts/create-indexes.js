// scripts/create-indexes.js
// Script to create all the necessary indexes for optimal database performance

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Use the URI from env variables with fallback to local MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gangio';

// Connection options for better performance and reliability
const options = {
  maxPoolSize: 10,
  writeConcern: {
    w: 'majority'
  }
};

async function createIndexes() {
  let client;
  
  try {
    console.log("Connecting to MongoDB...");
    client = new MongoClient(uri, options);
    await client.connect();
    console.log("Connected to MongoDB successfully");
    
    const db = client.db();
    
    // Create indexes for Users collection
    console.log("Creating indexes for Users collection...");
    await db.collection("users").createIndex({ email: 1 }, { unique: true, sparse: true });
    await db.collection("users").createIndex({ id: 1 }, { unique: true });
    await db.collection("users").createIndex({ name: 1, discriminator: 1 });
    await db.collection("users").createIndex({ status: 1 });
    await db.collection("users").createIndex({ friendIds: 1 });
    
    // Create indexes for Roles collection
    console.log("Creating indexes for Roles collection...");
    await db.collection("roles").createIndex({ id: 1 }, { unique: true });
    await db.collection("roles").createIndex({ serverId: 1, name: 1 });
    await db.collection("roles").createIndex({ serverId: 1 });
    
    // Create indexes for Channels collection
    console.log("Creating indexes for Channels collection...");
    await db.collection("channels").createIndex({ id: 1 }, { unique: true });
    await db.collection("channels").createIndex({ serverId: 1, type: 1 });
    await db.collection("channels").createIndex({ serverId: 1, categoryId: 1 });
    await db.collection("channels").createIndex({ serverId: 1, position: 1 });
    
    // Create indexes for Categories collection
    console.log("Creating indexes for Categories collection...");
    await db.collection("categories").createIndex({ id: 1 }, { unique: true });
    await db.collection("categories").createIndex({ serverId: 1 });
    await db.collection("categories").createIndex({ serverId: 1, position: 1 });
    
    // Create indexes for Servers collection
    console.log("Creating indexes for Servers collection...");
    await db.collection("servers").createIndex({ id: 1 }, { unique: true });
    await db.collection("servers").createIndex({ ownerId: 1 });
    await db.collection("servers").createIndex({ inviteCode: 1 }, { unique: true, sparse: true });
    await db.collection("servers").createIndex({ name: "text", description: "text" });
    
    // Create indexes for ServerMembers collection
    console.log("Creating indexes for ServerMembers collection...");
    await db.collection("serverMembers").createIndex({ userId: 1, serverId: 1 }, { unique: true });
    await db.collection("serverMembers").createIndex({ serverId: 1 });
    await db.collection("serverMembers").createIndex({ serverId: 1, joinedAt: 1 });
    
    // Create indexes for Messages collection
    console.log("Creating indexes for Messages collection...");
    await db.collection("messages").createIndex({ id: 1 }, { unique: true });
    await db.collection("messages").createIndex({ channelId: 1, createdAt: -1 });
    await db.collection("messages").createIndex({ authorId: 1 });
    await db.collection("messages").createIndex({ serverId: 1, channelId: 1 });
    await db.collection("messages").createIndex({ mentions: 1 });
    await db.collection("messages").createIndex({ channelId: 1, isPinned: 1 }, { sparse: true });
    
    // Create indexes for DirectMessages collection
    console.log("Creating indexes for DirectMessages collection...");
    await db.collection("directMessages").createIndex({ id: 1 }, { unique: true });
    await db.collection("directMessages").createIndex({ 
      senderId: 1, 
      recipientId: 1, 
      createdAt: -1 
    });
    await db.collection("directMessages").createIndex({ 
      recipientId: 1, 
      senderId: 1, 
      createdAt: -1 
    });
    await db.collection("directMessages").createIndex({ recipientId: 1, read: 1 });
    
    console.log("All indexes created successfully!");
  } catch (error) {
    console.error("Error creating indexes:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
}

// Run the function
createIndexes(); 