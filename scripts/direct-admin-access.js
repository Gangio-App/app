// Script to create a direct admin access token and HTML page
require('dotenv').config({ path: '.env.local' });
const { sign } = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Get the JWT secret from environment variables
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-fallback-secret-key";

// Create admin token with a long expiration (7 days)
const token = sign(
  {
    id: "admin",
    name: "Administrator",
    email: "admin@gangio.app",
    role: "admin",
    isAdmin: true
  },
  JWT_SECRET,
  { expiresIn: "7d" }
);

console.log("Generated admin token:", token);

// Create a simple HTML file that will set the cookie and redirect to admin panel
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Direct Admin Access</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .card {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    button {
      background-color: #e11d48;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover {
      background-color: #be123c;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Direct Admin Access</h1>
    <p>Click the button below to access the admin panel directly:</p>
    <button onclick="accessAdmin()">Access Admin Panel</button>
  </div>

  <script>
    function accessAdmin() {
      // Set the admin token cookie
      document.cookie = "admin-token=${token}; path=/; max-age=604800"; // 7 days
      // Redirect to admin panel
      window.location.href = "/admin";
    }

    // Auto-click the button after 1 second
    setTimeout(() => {
      document.querySelector('button').click();
    }, 1000);
  </script>
</body>
</html>
`;

// Write the HTML file
const htmlPath = path.join(__dirname, '..', 'direct-admin-access.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log(`Direct admin access page created at: ${htmlPath}`);
console.log("Open this file in your browser to access the admin panel directly.");
