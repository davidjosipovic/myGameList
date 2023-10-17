import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";
import TwitchProvider from "next-auth/providers/twitch";

export const authOptions: NextAuthOptions = {
  
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_ID,
      clientSecret: process.env.TWITCH_SECRET
    }),
    
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email or Username", type: "text" }, // Changed type to text to allow either email or username
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};
        if (!email || !password) {
          throw new Error("Missing username or password");
        }

        // Check if the provided email/username is actually an email or a username
        let user;
        if (email.includes("@")) { // If it includes '@', we treat it as an email
          user = await prisma.user.findUnique({
            where: {
              email,
            },
          });
        } else { // Else, treat it as a username
          user = await prisma.user.findUnique({
            where: {
              username: email,
            },
          });
        }

        // if user doesn't exist or password doesn't match
        if (!user || !(await compare(password, user.password))) {
          throw new Error("Invalid username or password");
        } 
        return user;
      },
    } as any),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
