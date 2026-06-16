import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "codepilot_secret_12345_dev";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Development Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "developer" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simple mock login for development purposes
        if (
          credentials?.username === "developer" || 
          credentials?.username === "codepilot_dev"
        ) {
          return {
            id: "1",
            name: "knowdev_dev",
            email: "dev@knowdev.ai",
          };
        }
        // Allow fallback user for other logins
        if (credentials?.username) {
          return {
            id: "2",
            name: credentials.username,
            email: `${credentials.username.toLowerCase()}@example.com`,
          };
        }
        return null;
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "MOCK_GITHUB_ID",
      clientSecret: process.env.GITHUB_SECRET || "MOCK_GITHUB_SECRET",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "MOCK_GOOGLE_ID",
      clientSecret: process.env.GOOGLE_SECRET || "MOCK_GOOGLE_SECRET",
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        
        // Sign custom JWT with standard HS256 algorithm for backend FastAPI validation
        const customPayload = {
          sub: user.id,
          name: user.name,
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
        };
        token.accessToken = jwt.sign(customPayload, JWT_SECRET, { algorithm: "HS256" });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Expose accessToken and id to frontend client session
        (session as any).user.id = token.id;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "nextauth_default_secret_998877665544332211",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
