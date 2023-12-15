import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email,name, password } = await req.json();
  const nameexists = await prisma.user.findUnique({
    where: {
    
      name
    },
  });
  const emailexists = await prisma.user.findUnique({
    where: {
    
      email
    },
  });
  if (emailexists || nameexists) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  } else {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: await hash(password, 10),
        picture:'/Default_pfp.png'
      },
    });
    return NextResponse.json(user);
  }
}