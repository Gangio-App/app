const { MongoClient } = require('mongodb');

async function checkServerDetails() {
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
    console.log(`\nFound ${servers.length} servers in database\n`);
    
    for (const server of servers) {
      console.log(`=== Server: ${server.name} (ID: ${server._id}, Custom ID: ${server.id}) ===`);
      
      // Get categories for this server
      const categories = await db.collection('categories').find({ serverId: server.id }).toArray();
      console.log(`\nCategories (${categories.length}):`);
      for (const category of categories) {
        console.log(`- ${category.name} (ID: ${category.id})`);
      }
      
      // Get channels for this server
      const channels = await db.collection('channels').find({ serverId: server.id }).toArray();
      console.log(`\nChannels (${channels.length}):`);
      for (const channel of channels) {
        console.log(`- ${channel.name} (Type: ${channel.type}, Category: ${channel.categoryId}, ID: ${channel.id})`);
      }
      
      // Get roles for this server
      const roles = await db.collection('roles').find({ serverId: server.id }).toArray();
      console.log(`\nRoles (${roles.length}):`);
      for (const role of roles) {
        console.log(`- ${role.name} (ID: ${role.id})`);
      }
      
      // Get server members
      const members = await db.collection('serverMembers').find({ serverId: server.id }).toArray();
      console.log(`\nMembers (${members.length}):`);
      for (const member of members) {
        console.log(`- User ID: ${member.userId}, Role IDs: ${JSON.stringify(member.roleIds)}`);
      }
      
      console.log('\n-----------------------------------\n');
    }
    
  } catch (error) {
    console.error('Error checking server details:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

checkServerDetails(); 