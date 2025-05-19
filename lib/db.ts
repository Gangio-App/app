import { MongoClient, Db, Collection, Document, MongoClientOptions } from "mongodb";

// Helper function to safely check if a client is connected
// This works with different MongoDB driver versions
function isClientConnected(client: MongoClient): boolean {
  try {
    // Modern way to check connection status
    // @ts-ignore - topology is internal but commonly used
    return client.topology?.isConnected?.() || 
           // @ts-ignore - Fallback for older MongoDB drivers
           client.isConnected?.() || 
           // Last resort - check if we can ping the server
           Boolean(client.db('admin').command({ ping: 1 }));
  } catch (error) {
    console.warn('[DB] Error checking connection status:', error);
    return false;
  }
}

// Explicitly log the environment variable being read
console.log(`[DB_INIT] Raw MONGODB_URI: ${process.env.MONGODB_URI?.substring(0, 20)}...`);

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'gangio'; 

// Cached connection promise to avoid reconnecting on every call
let cachedClient: MongoClient | null = null;
let cachedDbInstance: Db | null = null;

// Connection options with improved timeout settings and retry logic
const options: MongoClientOptions = {
  // Pool size settings optimized for serverless environments
  maxPoolSize: 10,             // Increased to handle more concurrent connections
  minPoolSize: 2,             // Increased minimum pool size for better availability
  maxIdleTimeMS: 120000,      // Increased to 2 minutes for better connection reuse
  
  // Timeout settings adjusted for network latency
  connectTimeoutMS: 60000,    // Increased to 60 seconds
  socketTimeoutMS: 90000,     // Increased to 90 seconds
  serverSelectionTimeoutMS: 60000, // Increased to 60 seconds
  waitQueueTimeoutMS: 60000,  // Increased queue timeout for better stability
  
  // Retry and write settings
  retryWrites: true,
  retryReads: true,
  writeConcern: { w: 'majority', wtimeout: 60000 }, // Increased write timeout
  maxConnecting: 5,           // Maximum number of concurrent connection attempts
  
  // Heartbeat monitoring optimized for stability
  heartbeatFrequencyMS: 60000, // Increased to reduce overhead in serverless
  
  // Connection settings
  directConnection: false,     // Required for MongoDB Atlas
  
  // Compression and performance settings
  compressors: ['zlib'],      // Array format for multiple compression options
  zlibCompressionLevel: 6,    // Balanced compression level
  
  // Server API version settings
  serverApi: {
    version: '1',            // Use latest stable API version
    strict: false,           // Set to false to allow text indexes
    deprecationErrors: true
  }
};

// Maximum number of connection retries with exponential backoff
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 1000; // Start with 1 second delay

// Helper function to wait between retries
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced connection function with retry logic
export async function connectToDatabase(): Promise<Db> {
  // If we have a cached DB instance and it's still connected, return it
  if (cachedDbInstance && cachedClient && isClientConnected(cachedClient)) {
    return cachedDbInstance;
  }

  // Validate URI *before* attempting to connect
  if (!uri) {
    console.error("[DB] MONGODB_URI environment variable is not defined!");
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  // Reset cached instances if they exist but aren't connected
  if (cachedClient && !isClientConnected(cachedClient)) {
    console.log('[DB] Existing client found but not connected. Resetting...');
    try {
      await cachedClient.close(true);
    } catch (closeError) {
      console.warn('[DB] Error while closing stale connection:', closeError);
    }
    cachedClient = null;
    cachedDbInstance = null;
  }

  // Connection with retry logic
  let lastError: Error | null = null;
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      if (!cachedClient) {
        console.log(`[DB] Creating new MongoClient (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        console.log(`[DB_INIT] Using MongoDB URI: ${uri.substring(0, 20)}...`);
        console.log(`[DB_INIT] Using Database Name: ${dbName}`);
        cachedClient = new MongoClient(uri, options);
      }

      console.log(`[DB] Attempting connection (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      await cachedClient.connect();
      console.log('[DB] MongoClient connected successfully!');

      // Add connection monitoring
      cachedClient.on('connectionPoolClosed', event => {
        console.warn('[DB POOL] Connection pool closed:', event);
        // Reset cache on pool closure to force reconnection on next request
        cachedDbInstance = null;
      });

      cachedClient.on('serverHeartbeatFailed', event => {
        console.warn('[DB HEARTBEAT] Server heartbeat failed:', event);
      });

      // Connection successful, break out of retry loop
      break;
    } catch (error) {
      lastError = error as Error;
      console.error(`[DB] Connection attempt ${retryCount + 1}/${MAX_RETRIES} failed:`, error);
      
      // Clean up failed connection attempt
      if (cachedClient) {
        try {
          await cachedClient.close(true);
        } catch (closeError) {
          console.warn('[DB] Error closing failed connection:', closeError);
        }
        cachedClient = null;
      }

      // If we've reached max retries, throw the last error
      if (retryCount >= MAX_RETRIES - 1) {
        console.error(`[DB] All ${MAX_RETRIES} connection attempts failed.`);
        throw lastError;
      }

      // Wait before retrying with exponential backoff
      const delayMs = BASE_RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`[DB] Waiting ${delayMs}ms before retry ${retryCount + 1}...`);
      await wait(delayMs);
      retryCount++;
    }
  }

  // Get the database instance from the connected client
  try {
    // At this point, cachedClient should be connected, but we add a check for safety
    if (!cachedClient) {
      throw new Error("[DB] MongoClient is not connected. Cannot get DB instance.");
    }
    
    // Verify the connection is still alive
    if (!isClientConnected(cachedClient)) {
      throw new Error("[DB] MongoClient is not connected. Connection check failed.");
    }
    
    console.log(`[DB] Getting database instance: ${dbName}`);
    cachedDbInstance = cachedClient.db(dbName);

    // Ensure indexes (run once per connection establishment)
    // Consider moving index creation to a separate script if it becomes too slow on startup
    try {
      await ensureIndexes(cachedDbInstance);
    } catch (indexError) {
      console.warn('[DB] Error ensuring indexes, but continuing:', indexError);
      // Continue anyway - indexes are important but not critical for basic operation
    }
    
    return cachedDbInstance;
  } catch (e) {
    console.error(`[DB] Failed to get database instance "${dbName}":`, e);
    if (cachedClient) {
      try {
        await cachedClient.close(true);
        console.log("[DB] Closed potentially problematic client connection.");
      } catch (closeError) {
        console.error("[DB] Error closing client after DB instance failure:", closeError);
      }
    }
    cachedClient = null;
    cachedDbInstance = null;
    throw e;
  }
} 

/**
 * Gets a MongoDB collection with the correct name, ensuring consistency.
 * @param db MongoDB database instance obtained from connectToDatabase()
 * @param name Collection name (e.g., 'users', 'servers', 'serverMembers')
 * @returns The MongoDB collection object (typed as Collection<Document>)
 */
export function getCollection(db: Db, name: string): Collection<Document> {
  const collectionMap: Record<string, string> = {
    'server_members': 'serverMembers',
    // Add other mappings if needed
  };
  const collectionName = collectionMap[name] || name;
  // console.log(`[DB] Accessing collection: ${collectionName}`);
  return db.collection(collectionName);
}

// Function to ensure all necessary indexes exist
async function ensureIndexes(db: any) {
  try {
    console.log("Checking and creating necessary indexes...");
    
    // Check for duplicate emails before creating unique index
    try {
      // Find duplicate emails
      const emailPipeline = [
        { $group: { _id: "$email", count: { $sum: 1 } } },
        { $match: { _id: { $ne: null }, count: { $gt: 1 } } }
      ];
      
      const duplicateEmails = await db.collection("users").aggregate(emailPipeline).toArray();
      
      if (duplicateEmails.length > 0) {
        console.log(`Found ${duplicateEmails.length} duplicate email(s). Fixing before creating unique index...`);
        
        // For each duplicate, keep one record and update others
        for (const dupEmail of duplicateEmails) {
          const email = dupEmail._id;
          const duplicateUsers = await db.collection("users").find({ email }).toArray();
          
          // Keep the first user with this email, update others
          for (let i = 1; i < duplicateUsers.length; i++) {
            const userId = duplicateUsers[i]._id;
            // Append a unique suffix to make the email unique
            const newEmail = `${email}.duplicate${i}@example.com`;
            await db.collection("users").updateOne(
              { _id: userId },
              { $set: { email: newEmail } }
            );
            console.log(`Updated duplicate email for user ${duplicateUsers[i].id} to ${newEmail}`);
          }
        }
      }
      
      // Now safe to create the unique index on email
      await db.collection("users").createIndex({ email: 1 }, { unique: true, sparse: true });
    } catch (emailError) {
      console.error("Error handling duplicate emails:", emailError);
      // Fall back to non-unique index if we can't fix duplicates
      await db.collection("users").createIndex({ email: 1 }, { sparse: true });
      console.log("Created non-unique index on email field instead due to duplicates");
    }
    
    // Continue with other indexes
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
    
    // Check for duplicate invite codes
    try {
      const inviteCodePipeline = [
        { $match: { inviteCode: { $ne: null } } },
        { $group: { _id: "$inviteCode", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ];
      
      const duplicateInviteCodes = await db.collection("servers").aggregate(inviteCodePipeline).toArray();
      
      if (duplicateInviteCodes.length > 0) {
        console.log(`Found ${duplicateInviteCodes.length} duplicate invite code(s). Fixing before creating unique index...`);
        
        for (const dupCode of duplicateInviteCodes) {
          const inviteCode = dupCode._id;
          const duplicateServers = await db.collection("servers").find({ inviteCode }).toArray();
          
          // Keep the first server with this invite code, update others
          for (let i = 1; i < duplicateServers.length; i++) {
            const serverId = duplicateServers[i]._id;
            // Generate a new random invite code
            const newInviteCode = Math.random().toString(36).substring(2, 10);
            await db.collection("servers").updateOne(
              { _id: serverId },
              { $set: { inviteCode: newInviteCode } }
            );
            console.log(`Updated duplicate invite code for server ${duplicateServers[i].id} to ${newInviteCode}`);
          }
        }
      }
      
      await db.collection("servers").createIndex({ inviteCode: 1 }, { unique: true, sparse: true });
    } catch (inviteCodeError) {
      console.error("Error handling duplicate invite codes:", inviteCodeError);
      // Fall back to non-unique index
      await db.collection("servers").createIndex({ inviteCode: 1 }, { sparse: true });
      console.log("Created non-unique index on inviteCode field instead due to duplicates");
    }
    
    await db.collection("servers").createIndex({ name: "text", description: "text" });
    
    // Create indexes for ServerMembers collection
    console.log("Creating indexes for ServerMembers collection...");
    
    // Check for duplicate server memberships
    try {
      const membershipPipeline = [
        { $group: { _id: { userId: "$userId", serverId: "$serverId" }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ];
      
      const duplicateMemberships = await db.collection("serverMembers").aggregate(membershipPipeline).toArray();
      
      if (duplicateMemberships.length > 0) {
        console.log(`Found ${duplicateMemberships.length} duplicate server membership(s). Fixing before creating unique index...`);
        
        for (const dupMembership of duplicateMemberships) {
          const { userId, serverId } = dupMembership._id;
          const duplicateMembers = await db.collection("serverMembers").find({ userId, serverId }).toArray();
          
          // Keep the first membership, delete others
          for (let i = 1; i < duplicateMembers.length; i++) {
            await db.collection("serverMembers").deleteOne({ _id: duplicateMembers[i]._id });
            console.log(`Deleted duplicate server membership for user ${userId} in server ${serverId}`);
          }
        }
      }
      
      await db.collection("serverMembers").createIndex({ userId: 1, serverId: 1 }, { unique: true });
    } catch (membershipError) {
      console.error("Error handling duplicate server memberships:", membershipError);
      // Fall back to non-unique index
      await db.collection("serverMembers").createIndex({ userId: 1, serverId: 1 });
      console.log("Created non-unique index on server membership instead due to duplicates");
    }
    
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
    
    console.log("Indexes verification complete");
  } catch (error) {
    console.error("Error ensuring indexes:", error);
    // Don't throw the error - we want the app to still function even if index creation fails
  }
} 