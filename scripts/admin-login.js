// Script to directly create an admin token for quick access
require('dotenv').config({ path: '.env.local' });
const { sign } = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-fallback-secret-key";

// Create admin token
const token = sign(
  {
    id: "admin",
    name: "Administrator",
    email: "admin@gangio.app",
    role: "admin",
    isAdmin: true
  },
  JWT_SECRET,
  { expiresIn: "7d" } // 7 days
);

console.log("Admin token created successfully!");
console.log("Token:", token);

// Create a simple HTML file with the token
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Admin Login</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    h1 {
      color: #333;
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
    pre {
      background-color: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>Admin Login Helper</h1>
  <div class="card">
    <h2>Login to Admin Panel</h2>
    <p>Click the button below to set the admin token cookie and access the admin panel:</p>
    <button onclick="setAdminToken()">Login as Admin</button>
  </div>
  
  <div class="card">
    <h2>Admin Token</h2>
    <p>This is your admin token (valid for 7 days):</p>
    <pre>${token}</pre>
  </div>

  <script>
    function setAdminToken() {
      // Set the admin token cookie
      document.cookie = "admin-token=${token}; path=/; max-age=604800"; // 7 days
      // Redirect to admin panel
      window.location.href = "/admin";
    }
  </script>
</body>
</html>
`;

// Write the HTML file
const htmlPath = path.join(__dirname, '..', 'admin-login.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log(`HTML file created at: ${htmlPath}`);
console.log("Open this file in your browser and click the 'Login as Admin' button to access the admin panel.");
