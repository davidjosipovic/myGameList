import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
const { email, name, password, account_provider } = await req.json();
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

    if (account_provider === "google") {
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: "",
          picture: '/Default_pfp.png'
        },
      });

      return NextResponse.json(user);
    }
    else {
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: await hash(password, 10),
          picture: '/Default_pfp.png'
        },
      });
      return NextResponse.json(user);
    }
  }
  } catch (error) {
    return NextResponse.json(error)
  }
  
}