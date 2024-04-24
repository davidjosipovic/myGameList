import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const name = params.id.replace(/%C4%87/g, 'ć').replace(/%20/g, ' ');

  try {
    // Fetch the user based on the email
    const user = await prisma.user.findUnique({
      where: {
        name: name,
      },
    });

    if (!user) {
      return NextResponse.json({ status: 404, statusText: 'User not found' });
    }

    // Sanitize any sensitive data before returning
    // delete user.password;  // e.g., if there's a password field

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ status: 500, statusText: 'Internal Server Error' });
  }
}
