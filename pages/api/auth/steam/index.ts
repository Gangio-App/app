import { NextApiRequest, NextApiResponse } from 'next';
import passport from '@/lib/passport'; // Import the configured passport instance

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use passport.authenticate, specifying the 'steam' strategy
  // This will redirect the user to Steam for authentication
  passport.authenticate('steam', { failureRedirect: '/', session: false })(req, res, (...args: any[]) => {
    // This callback shouldn't really be reached on success 
    // because Steam redirects externally.
    // Handle potential immediate failures if necessary.
    console.error("Steam authentication initiation failed unexpectedly", args);
    res.redirect('/'); // Redirect to home on failure
  });
} 