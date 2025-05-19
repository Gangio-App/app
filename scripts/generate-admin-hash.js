// Script to generate a bcrypt hash for admin password
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const password = process.argv[2] || 'ertacdemm';
const saltRounds = 10;

// Generate hash
bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  
  console.log('Generated hash for password:', password);
  console.log('Hash:', hash);
  
  // Read current .env.local file
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update ADMIN_PASSWORD and ADMIN_PASSWORD_HASH
  envContent = envContent.replace(
    /^ADMIN_PASSWORD=.*/m, 
    `ADMIN_PASSWORD=${password}`
  );
  
  envContent = envContent.replace(
    /^ADMIN_PASSWORD_HASH=.*/m, 
    `ADMIN_PASSWORD_HASH=${hash}`
  );
  
  // Write back to .env.local
  fs.writeFileSync(envPath, envContent);
  
  console.log('Updated .env.local file with new password and hash');
  console.log('Please restart your server for changes to take effect');
});
