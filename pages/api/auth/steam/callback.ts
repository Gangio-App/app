import { NextApiRequest, NextApiResponse } from 'next';
import passport from '@/lib/passport'; // Import the configured passport instance
// import { Session } from 'next-auth'; // Import if integrating with next-auth sessions
// import { getSession } from 'next-auth/react'; // Import if integrating
// Import NextAuth functions and DB helpers
import { getServerSession } from "next-auth/next"
// Import from the correct location
import { authOptions } from "@/lib/auth"; 
import { connectToDatabase, getCollection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get current NextAuth session
  // Note: Using getServerSession requires req and res directly
  const session = await getServerSession(req, res, authOptions);

  passport.authenticate('steam', { failureRedirect: '/', session: false }, async (err: any, steamProfile: any, info: any) => {
    // Note: `steamProfile` can be either the user object from DB (if found in strategy) 
    // or the raw Steam info object { steamId, steamName, ... } if not found.

    if (err) {
      console.error('Steam callback error:', err);
      return res.redirect('/settings/connections?error=SteamAuthenticationFailed');
    }
    if (!steamProfile) {
      console.error('Steam callback: No steam profile data received');
      return res.redirect('/settings/connections?error=SteamProfileNotFound'); 
    }

    // --- Account Linking Logic --- 
    if (session && session.user) {
      // User is logged in via NextAuth - Link Steam account
      const loggedInUserId = (session.user as any).id; // Get user ID from session
      const { steamId, steamName, steamProfileUrl, steamAvatarUrl } = steamProfile;
      
      if (!steamId) {
         console.error('Steam callback: steamId missing from profile data');
         return res.redirect('/settings/connections?error=SteamIdMissing');
      }

      try {
        const db = await connectToDatabase();
        const usersCollection = getCollection(db, 'users');
        
        // Check if this steamId is already linked to ANOTHER user
        const existingSteamLink = await usersCollection.findOne({ 
          steamId: steamId,
          id: { $ne: loggedInUserId } // Check it's not the current user already
        });
        
        if (existingSteamLink) {
            console.warn(`Steam ID ${steamId} is already linked to user ${existingSteamLink.id}`);
            return res.redirect('/settings/connections?error=SteamAccountAlreadyLinked');
        }

        // Update the logged-in user's record with Steam details
        const updateResult = await usersCollection.updateOne(
          { id: loggedInUserId }, // Find user by their main ID
          { 
            $set: {
              steamId: steamId,
              steamProfileUrl: steamProfileUrl, 
              steamAvatarUrl: steamAvatarUrl, // Consider using Steam avatar or keeping existing one
              // Optionally update name? Be careful not to overwrite user's preference
              // name: steamName,
              updatedAt: new Date()
            }
          }
        );
        
        if (updateResult.modifiedCount > 0) {
             console.log(`Successfully linked Steam ID ${steamId} to user ${loggedInUserId}`);
        } else {
             console.log(`User ${loggedInUserId} already had Steam ID ${steamId} linked or user not found.`);
        }

        // Redirect back to connections settings page on success
        return res.redirect('/settings/connections?success=true');

      } catch (dbError) {
         console.error('Database error linking Steam account:', dbError);
         return res.redirect('/settings/connections?error=DatabaseError');
      }
      
    } else {
      // User is NOT logged in - This flow is for LINKING only.
      // If a user tries to access this callback without being logged in,
      // redirect them to login or an error page.
      console.warn('Steam callback reached without active session. Redirecting to login.');
      // Redirect to login page, or perhaps the connections page with an error
      return res.redirect('/api/auth/signin?error=SessionRequiredForSteamLink'); 
    }
    // --- End Linking Logic --- 

  })(req, res);
} 