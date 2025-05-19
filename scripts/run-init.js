// Script to run the admin initialization with environment variables
require('dotenv').config();
const { exec } = require('child_process');

console.log('Starting admin initialization process...');
console.log(`Using MongoDB URI: ${process.env.MONGODB_URI ? '✓ Found' : '✗ Not found'}`);
console.log(`Using MongoDB DB Name: ${process.env.MONGODB_DB_NAME || 'gangio'}`);

// Run the initialization script
exec('node scripts/init-admin.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Output: ${stdout}`);
  console.log('Admin initialization completed successfully!');
});
