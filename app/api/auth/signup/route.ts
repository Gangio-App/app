// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// Apply the same timeout pattern we used for server fetching
const API_TIMEOUT_MS = 8000; // 8 seconds total timeout for the entire API call

export async function POST(req: NextRequest) {
  // Set a timeout for the entire API call to prevent Vercel function timeouts
  const apiTimeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Signup API timeout')), API_TIMEOUT_MS);
  });
  
  // Wrap the signup process in a promise that can be raced against the timeout
  const signupPromise = async () => {
    try {
      const { name, email, password, discriminator } = await req.json();

      if (!name || !email || !password) {
        return NextResponse.json(
          { error: "Name, email and password are required" },
          { status: 400 }
        );
      }

      const db = await connectToDatabase();
      
      // Check site settings first
      const settingsCollection = db.collection("settings");
      const siteSettings = await settingsCollection.findOne({ type: "site" });
      
      // If maintenance mode is enabled or registration is disabled, block signup
      if (siteSettings?.maintenance || siteSettings?.registrationEnabled === false) {
        return NextResponse.json(
          { error: "Registration is currently disabled" },
          { status: 403 }
        );
      }
      
      const usersCollection = db.collection("users");

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: uuidv4(),
      name,
      email,
      discriminator: discriminator || Math.floor(1000 + Math.random() * 9000).toString(),
      passwordHash,
      status: "online",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await usersCollection.insertOne(user);

      // Return user without password
      const { passwordHash: _, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword);
    } catch (error) {
      console.error("Signup error:", error);
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }
  };
  
  // Race the signup process against the timeout
  try {
    return await Promise.race([signupPromise(), apiTimeoutPromise]);
  } catch (error) {
    console.error("Signup API error or timeout:", error);
    return NextResponse.json(
      { error: "Request timed out or failed" },
      { status: 500 }
    );
  }
}