// scripts/check-server-data.js
// This script checks server and server member data in MongoDB
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function checkServerData() {
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check servers collection
    const serverCount = await db.collection('servers').countDocuments();
    console.log(`Total servers in database: ${serverCount}`);
    
    let servers = [];
    if (serverCount > 0) {
      servers = await db.collection('servers').find().limit(5).toArray();
      console.log('Sample servers:');
      servers.forEach(server => {
        console.log(`- ${server.name} (ID: ${server.id}, Owner: ${server.ownerId})`);
      });
    }
    
    // Check server_members collection
    const memberCount = await db.collection('serverMembers').countDocuments();
    console.log(`\nTotal server memberships: ${memberCount}`);
    
    if (memberCount > 0) {
      const members = await db.collection('serverMembers').find().limit(5).toArray();
      console.log('Sample server memberships:');
      members.forEach(member => {
        console.log(`- Server: ${member.serverId}, User: ${member.userId}`);
      });
      
      // Check if any test user exists in both collections
      if (servers.length > 0 && members.length > 0) {
        const testMember = members[0];
        const user = await db.collection('users').findOne({ id: testMember.userId });
        if (user) {
          console.log(`\nTest user found: ${user.name} (ID: ${user.id})`);
          
          // Check this user's server memberships
          const userMemberships = await db.collection('serverMembers')
            .find({ userId: user.id })
            .toArray();
          
          console.log(`User belongs to ${userMemberships.length} servers:`);
          
          // Get the server details for each membership
          for (const membership of userMemberships) {
            const server = await db.collection('servers').findOne({ id: membership.serverId });
            if (server) {
              console.log(`- ${server.name} (ID: ${server.id})`);
            } else {
              console.log(`- Unknown server (ID: ${membership.serverId})`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking server data:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

checkServerData(); 