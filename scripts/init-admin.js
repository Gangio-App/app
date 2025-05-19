// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// Admin credentials - in production, these should be stored securely in environment variables
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "adminSecretPassword123";
const ADMIN_PASSWORD_HASH = "$2b$10$OM9HJ2QGZ9KVG5nJU.MRPuHZKMM9GAuAJAhC7tBLMn9vSKxSbPBJa"; // bcrypt hash of 'adminSecretPassword123'

// Site settings
const SITE_SETTINGS = {
  type: "site",
  maintenance: false,
  registrationEnabled: true,
  termsLastUpdated: new Date(),
  recaptchaEnabled: true,
  recaptchaSiteKey: "6Lfv3DMrAAAAAED6cPgz8fjdynqox-4PErFX6js6",
  recaptchaSecretKey: "6Lfv3DMrAAAAAGrO2sFmbq-goszIaQ06miX3r6wB",
  termsContent: `# Terms and Conditions

Welcome to Gangio!

These terms and conditions outline the rules and regulations for the use of our platform.

## 1. Acceptance of Terms

By accessing this website, you accept these terms and conditions in full. If you disagree with these terms and conditions or any part of them, you must not use this website.

## 2. User Accounts

When you create an account with us, you must provide information that is accurate, complete, and current at all times.

## 3. Content Guidelines

Users are prohibited from posting content that is illegal, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically or otherwise objectionable.

## 4. Termination

We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

## 5. Limitation of Liability

In no event shall Gangio, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.

## 6. Governing Law

These Terms shall be governed and construed in accordance with the laws applicable in your jurisdiction, without regard to its conflict of law provisions.

## 7. Changes to Terms

We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect.

## 8. Contact Us

If you have any questions about these Terms, please contact us.`
};

async function initializeAdmin() {
  console.log('Starting admin initialization...');
  
  // Get MongoDB connection string from environment variable
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'project0-db';
  
  console.log(`MongoDB URI: ${uri ? '✓ Found' : '✗ Not found'}`);
  console.log(`MongoDB DB Name: ${dbName}`);
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not defined!');
    process.exit(1);
  }
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 5,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB successfully!');
    
    const db = client.db(dbName);
    
    // Check if admin user already exists
    const adminUsersCollection = db.collection('adminUsers');
    const existingAdmin = await adminUsersCollection.findOne({ username: ADMIN_USERNAME });
    
    if (!existingAdmin) {
      console.log('Creating admin user...');
      await adminUsersCollection.insertOne({
        username: ADMIN_USERNAME,
        passwordHash: ADMIN_PASSWORD_HASH,
        role: 'admin',
        createdAt: new Date(),
      });
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists, skipping creation.');
    }
    
    // Check if site settings already exist
    const settingsCollection = db.collection('settings');
    const existingSettings = await settingsCollection.findOne({ type: 'site' });
    
    if (!existingSettings) {
      console.log('Creating site settings...');
      await settingsCollection.insertOne(SITE_SETTINGS);
      console.log('Site settings created successfully!');
    } else {
      console.log('Site settings already exist, updating...');
      await settingsCollection.updateOne(
        { type: 'site' },
        { $set: {
          recaptchaEnabled: SITE_SETTINGS.recaptchaEnabled,
          recaptchaSiteKey: SITE_SETTINGS.recaptchaSiteKey,
          recaptchaSecretKey: SITE_SETTINGS.recaptchaSecretKey,
        }}
      );
      console.log('Site settings updated successfully!');
    }
    
    console.log('Admin initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing admin:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed.');
    }
  }
}

// Run the initialization function
console.log('Environment variables loaded, starting initialization...');
initializeAdmin().catch(console.error);
