import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";
import TwitchProvider from "next-auth/providers/twitch";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user };
      }
      return { ...token, ...user };
    },
    async session({ session, token }) {
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      });
      token.name=user.name
      session.user = token as any;
      return session;
    },
    async signIn({ account, profile }) {
      if (account.provider === "google") {
        console.log(profile)
        const user = await prisma.user.findUnique({
          where: {
            email: profile.email,
          },
        });
        if(user){
          
          
        }
        else{
          fetch(`${process.env.DOMAIN}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: profile.email,
            name: profile.name, 
            iss: profile.iss, 
          }),
        }).then(async (res) => {
          if (res.status === 200) {
            console.log("Account created! Redirecting to login...");
            
          } else {
            const { error } = await res.json();
            console.error(error);
          }
        });
        }
      }
      return true // Do different verification for other providers that don't have `email_verified`
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),
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
        let user:any;
        if (email.includes("@")) { // If it includes '@', we treat it as an email
          user = await prisma.user.findUnique({
            where: {
              email,
            },
          });
        } else { // Else, treat it as a username
          user = await prisma.user.findUnique({
            where: {
              name: email,
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
