import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
// Import necessary DB functions and potentially User model/interface
import { connectToDatabase, getCollection } from '@/lib/db'; 
// Assuming IUser is the interface defined in gangio.md, adjust path if necessary
// import { IUser } from '@/path/to/user/definition'; 
import { ObjectId } from 'mongodb';

// Placeholder for NEXTAUTH_URL - REPLACE WITH ACTUAL VALUE
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'; 

passport.use(new SteamStrategy({
    returnURL: `${BASE_URL}/api/auth/steam/callback`,
    realm: BASE_URL, // Your site URL
    apiKey: process.env.STEAM_API_KEY!
  },
  async (identifier, profile, done) => {
    // identifier is the Steam OpenID URL
    // profile contains Steam user data (id, displayName, photos, etc.)
    console.log('Steam profile received:', profile);
    const steamId = profile.id; // Steam 64-bit ID
    const steamProfileUrl = profile._json.profileurl; // Extract profile URL
    const steamAvatarUrl = profile.photos ? profile.photos[2]?.value : null; // Largest avatar

    try {
      const db = await connectToDatabase();
      const usersCollection = getCollection(db, 'users');

      // --- Database Interaction --- 
      // 1. Find user by steamId
      let user = await usersCollection.findOne({ steamId: steamId });
      
      // 2. If user doesn't exist, we cannot create one here easily without more info
      //    (like email, discriminator, etc.). Passport strategy is best used for LOGIN 
      //    or LINKING an existing account found via session in the callback route.
      //    If you want users to SIGN UP via Steam, you'll need a different flow 
      //    or redirect them to a registration page with pre-filled Steam data.
      
      // 3. If user EXISTS, update their Steam details (optional, good for avatar/url updates)
      if (user) {
        await usersCollection.updateOne(
          { steamId: steamId },
          { 
            $set: {
              name: profile.displayName, // Update name from Steam? Or keep existing?
              steamProfileUrl: steamProfileUrl,
              steamAvatarUrl: steamAvatarUrl,
              updatedAt: new Date()
            }
          }
        );
        // Re-fetch user data after update to pass to done
        user = await usersCollection.findOne({ steamId: steamId }); 
      } else {
        // If user not found by steamId, return null. 
        // The callback route MUST handle linking this steamId to a logged-in user.
        console.log(`Steam user ${steamId} not found in DB. Linking required in callback.`);
        // Pass necessary Steam info for potential linking/account creation in callback
        const steamInfoForLinking = {
          steamId: steamId,
          steamName: profile.displayName,
          steamProfileUrl: steamProfileUrl,
          steamAvatarUrl: steamAvatarUrl
        }
        return done(null, steamInfoForLinking); 
      }

      // Ensure we pass a consistent user object structure (adapt as needed)
      const userForSession = user ? {
        _id: user._id.toString(), // Use DB user ID
        id: user.id,              // Your custom UUID
        steamId: user.steamId,
        name: user.name,
        email: user.email,       // Might be null if originally from Steam
        avatarUrl: user.avatarUrl,
        // Add other fields needed by session/frontend
      } : null;
      
      // Pass the found/updated user object (or null) to done
      return done(null, userForSession);
    } catch (error) {
      console.error("Error in Steam strategy verify callback:", error);
      return done(error);
    }
  }
));

// --- Passport Session Serialization/Deserialization --- 
// TODO: Implement proper serialization/deserialization using database user IDs
// if using Passport sessions directly (might be handled by NextAuth instead)

// passport.serializeUser((user: any, done) => {
//   done(null, user._id); // Serialize DB _id
// });

// passport.deserializeUser(async (id: string, done) => {
//   try {
//     const db = await connectToDatabase();
//     const user = await getCollection(db, 'users').findOne({ _id: new ObjectId(id) });
//     done(null, user); 
//   } catch (error) {
//     done(error);
//   }
// });

export default passport; 