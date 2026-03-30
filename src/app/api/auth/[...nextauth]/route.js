import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb"; // 1. IMPORT THIS

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const collection = await dbConnect("users");

          const user = await collection.findOne({ email: credentials.email });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google" || account.provider === "facebook") {
        try {
          const collection = await dbConnect("users");
          const existingUser = await collection.findOne({ email: user.email });

          if (!existingUser) {
            const newUser = {
              name: user.name,
              email: user.email,
              image: user.image,
              role: "user",
              provider: account.provider,
              providerId: account.providerAccountId,
              verified: true,
              createdAt: new Date(),
            };
            await collection.insertOne(newUser);
          }
          return true;
        } catch (error) {
          console.error("Error during social sign-in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // 1. INITIAL SIGN IN
      // This runs only once when the user logs in
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }

      // 2. SESSION REFRESH / UPDATE
      // This runs every time the session is checked or update() is called
      // We fetch the LATEST data from DB to ensure Role changes are picked up
      if (token?.sub) {
        try {
          const collection = await dbConnect("users");
          const dbUser = await collection.findOne({
            _id: new ObjectId(token.sub),
          });

          if (dbUser) {
            // Overwrite the token data with fresh DB data
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.picture = dbUser.image; // Sync avatar too
          }
        } catch (error) {
          console.error("Error syncing session token with DB:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    signUp: "/sign-up",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
