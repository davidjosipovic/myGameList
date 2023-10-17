import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email,username, password } = await req.json();
  const exists = await prisma.user.findUnique({
    where: {
      email,
      username,
    },
  });
  if (exists) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  } else {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: await hash(password, 10),
      },
    });
    return NextResponse.json(user);
  }
}