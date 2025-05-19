import { MongoClient, MongoClientOptions } from 'mongodb';

// Use the URI from env variables with fallback to local MongoDB
// Remove hardcoded credentials from code
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gangio';

// Connection options for better performance and reliability
const options: MongoClientOptions = {
  maxPoolSize: 50,
  minPoolSize: 10,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 15000, // Increased timeout
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 15000, // Increased timeout
  retryWrites: true,
  retryReads: true,
  writeConcern: {
    w: 'majority'
  }
};

let client;
let clientPromise: Promise<MongoClient>;

console.log("MongoDB: Connecting with URI pattern:", uri.split('@')[0].split(':')[0] + ':***@' + (uri.split('@')[1] || 'localhost'));

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    console.log("MongoDB: Creating new client in development mode");
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .then(client => {
        console.log("MongoDB: Connected successfully");
        return client;
      })
      .catch(error => {
        console.error("MongoDB: Connection failed:", error);
        if (uri !== 'mongodb://localhost:27017/gangio') {
          console.log("MongoDB: Attempting to connect to local fallback...");
          const localClient = new MongoClient('mongodb://localhost:27017/gangio', options);
          return localClient.connect();
        }
        throw error;
      });
  } else {
    console.log("MongoDB: Using existing connection from global scope");
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  console.log("MongoDB: Creating new client in production mode");
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(client => {
      console.log("MongoDB: Connected successfully in production");
      return client;
    })
    .catch(error => {
      console.error("MongoDB: Connection failed in production:", error);
      throw error;
    });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export { clientPromise };
export default clientPromise;