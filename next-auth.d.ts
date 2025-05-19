import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique identifier. */
      id: string;
      // You can add other custom properties to session.user here if needed
      // For example, if you add 'role' or 'username' in your authOptions callbacks:
      // role?: string;
      // username?: string;
    } & DefaultSession['user']; // Extends the default user properties (name, email, image)
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    // Add any custom properties your User object might have from the database
    // that you want to access in callbacks *before* they are put into the session or JWT.
    // Example:
    // role?: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** OpenID ID Token */
    id?: string; // Add id here if you are passing it through the JWT token
    // You can add other custom properties to the JWT here
    // Example:
    // role?: string;
  }
}
