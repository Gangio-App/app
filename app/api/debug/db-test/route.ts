import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// A simple API route to test MongoDB connectivity
export async function GET(req: NextRequest) {
  // Get MongoDB URI from environment variables with a fallback
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/gangio";
  
  console.log("Testing MongoDB connection with URI pattern:", 
    uri.split('@')[0].split(':')[0] + ':***@' + (uri.split('@')[1] || 'localhost'));
  
  // Use more forgiving connection options for testing
  const options = {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 30000,
    maxPoolSize: 10,
    retryWrites: true,
    retryReads: true
  };
  
  let client;
  try {
    console.log("Creating MongoDB client for test...");
    client = new MongoClient(uri, options);
    
    console.log("Attempting to connect to MongoDB...");
    await client.connect();
    console.log("Successfully connected to MongoDB");
    
    // Test if we can access the database
    const db = client.db();
    console.log("Accessed database");
    
    // Test if we can list collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log("Successfully listed collections:", collectionNames);
    
    // Try to check for servers collection
    const hasServersCollection = collectionNames.includes('servers');
    if (hasServersCollection) {
      const serverCount = await db.collection('servers').countDocuments();
      console.log(`Found servers collection with ${serverCount} documents`);
    } else {
      console.log("Servers collection not found");
    }
    
    // Return success response
    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connection test successful',
      collections: collectionNames,
      dbName: db.databaseName,
      serverInfo: {
        isConnected: true, // If we got this far, we're connected
        hasServersCollection,
        serversCount: hasServersCollection ? await db.collection('servers').countDocuments() : 0
      }
    });
  } catch (error) {
    console.error("MongoDB connection test failed:", error);
    
    // Detailed error logging
    let errorDetails = {};
    if (error instanceof Error) {
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: (error as any).cause || 'unknown'
      };
      
      // Check specific error types
      if (error.name === 'MongoNetworkError') {
        errorDetails = {
          ...errorDetails,
          suggestion: "This might be a network connectivity issue or firewall problem"
        };
      } else if (error.name === 'MongoServerSelectionError') {
        errorDetails = {
          ...errorDetails,
          suggestion: "The MongoDB server might be down or unreachable"
        };
      } else if (error.message.includes('authentication')) {
        errorDetails = {
          ...errorDetails,
          suggestion: "This might be an authentication issue - check credentials"
        };
      }
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'MongoDB connection test failed',
      error: errorDetails,
      uriPattern: uri.split('@')[0].split(':')[0] + ':***@' + (uri.split('@')[1] || 'localhost')
    }, { status: 500 });
  } finally {
    // Ensure client is closed
    if (client) {
      try {
        await client.close();
        console.log("MongoDB client closed");
      } catch (closeError) {
        console.error("Error closing MongoDB client:", closeError);
      }
    }
  }
} 