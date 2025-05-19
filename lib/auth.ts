import { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "./mongodb";
import { getServerSession } from "next-auth/next";
import { Db } from "mongodb";
import type { JWT } from "next-auth/jwt";
import type { AdapterUser } from "@auth/core/adapters";
import type { User, Account, Profile } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

// Custom Steam provider since next-auth doesn't export it directly
const SteamProvider = {
  id: "steam",
  name: "Steam",
  type: "oauth" as const,
  authorization: {
    url: "https://steamcommunity.com/openid/login",
    params: {
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": `${process.env.NEXTAUTH_URL}/api/auth/callback/steam`,
      "openid.realm": process.env.NEXTAUTH_URL,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    },
  },
  token: {
    async request() {
      return { tokens: { access_token: "" } };
    },
  },
  userinfo: {
    async request(context: any) {
      const steamID = context.tokens.access_token;
      const apiKey = process.env.STEAM_API_KEY;
      const response = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamID}`
      );
      const data = await response.json();
      const profile = data.response.players[0];
      
      return {
        id: profile.steamid,
        name: profile.personaname,
        image: profile.avatarfull,
      };
    },
  },
  profile(profile: any) {
    return {
      id: profile.id,
      name: profile.name,
      image: profile.image,
    };
  },
};

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "$2a$10$U/yYob2BgK4Nm2Wki41EL.4EOmos2pjEM.LSWuZMOBiHu9YGTHrSO";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    // Admin credentials provider
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        // Check if username matches admin username
        if (credentials.username !== ADMIN_USERNAME) return null;
        
        // Verify password
        const isValid = await compare(credentials.password, ADMIN_PASSWORD_HASH);
        if (!isValid) return null;
        
        // Return admin user object
        return {
          id: "admin",
          name: "Administrator",
          email: "admin@gangio.app",
          role: "admin"
        };
      }
    }),
    SteamProvider,
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Admin sign in via credentials
      if (user && user.role === "admin") {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = "admin";
        token.isAdmin = true;
        return token;
      }
      
      // Regular user sign in
      if (account && user) {
        // Get MongoDB connection
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME as string);
        
        // Check if user exists in your custom users collection
        const existingUser = await db.collection("users").findOne({
          steamId: user.id,
        });

        if (existingUser) {
          // Update existing user with latest Steam data
          await db.collection("users").updateOne(
            { steamId: user.id },
            {
              $set: {
                lastLogin: new Date(),
                steamName: user.name,
                steamAvatar: user.image,
              },
            }
          );
        } else {
          // Create new user with Steam data
          await db.collection("users").insertOne({
            steamId: user.id,
            steamName: user.name,
            steamAvatar: user.image,
            createdAt: new Date(),
            lastLogin: new Date(),
          });
        }

        const newToken = { ...token };
        newToken.id = user.id;
        newToken.steamId = user.id;
        newToken.steamName = user.name || '';
        newToken.steamAvatar = user.image || '';
        return newToken;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = session.user || {};
        session.user.id = token.id as string;
        
        // Admin role handling
        if (token.role === "admin") {
          session.user.role = "admin";
          session.user.isAdmin = true;
        } else {
          // Regular user data
          session.user.steamId = token.steamId as string;
          session.user.steamName = (token.steamName as string | null | undefined) || '';
          session.user.steamAvatar = (token.steamAvatar as string | null | undefined) || '';
        }
        
        // Common fields
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-key",
  debug: process.env.NODE_ENV === "development",
};

// Helper function to get the session on the server side
export const getAuthSession = () => getServerSession(authOptions);

// Extend next-auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      steamId?: string;
      steamName?: string;
      steamAvatar?: string;
      name?: string | null | undefined;
      email?: string | null | undefined;
      image?: string | null | undefined;
      role?: string;
      isAdmin?: boolean;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    steamId?: string;
    steamName?: string;
    steamAvatar?: string;
    role?: string;
    isAdmin?: boolean;
  }
}
