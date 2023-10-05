import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

// Fetch all posts (in /pages/api/posts.ts)
const prisma = new PrismaClient()

export async function GET() {
    const users=await prisma.user.findMany()
  return Response.json(users)
}