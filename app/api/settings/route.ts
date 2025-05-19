import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

// Apply the same timeout pattern we used for server fetching
const FETCH_TIMEOUT_MS = 5000;

export async function GET(req: NextRequest) {
  try {
    // Set a timeout for the entire API call to prevent Vercel function timeouts
    const apiTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Settings fetch timeout')), FETCH_TIMEOUT_MS);
    });
    
    // Wrap settings fetch in a promise that can be raced against the timeout
    const fetchPromise = async () => {
      const db = await connectToDatabase();
      const settings = await db.collection("settings").findOne({ type: "site" });
      
      // Return only public settings
      return {
        maintenance: settings?.maintenance || false,
        registrationEnabled: settings?.registrationEnabled !== false, // Default to true
        termsLastUpdated: settings?.termsLastUpdated || new Date()
      };
    };
    
    // Race the fetch against the timeout
    const publicSettings = await Promise.race([fetchPromise(), apiTimeoutPromise]);
    
    return NextResponse.json(publicSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    
    // Return default settings in case of error
    return NextResponse.json({
      maintenance: false,
      registrationEnabled: true,
      termsLastUpdated: new Date()
    });
  }
}
