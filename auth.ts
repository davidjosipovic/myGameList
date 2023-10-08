import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import  PostgresAdapter  from "@auth/pg-adapter"
import { Pool } from "pg"

const pool = new Pool({
  host: "localhost",
  user: "database-user",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

export default NextAuth({
  adapter: PostgresAdapter(pool),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ]
})