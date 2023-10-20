import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const name = params.id;

  try {
    // Fetch the user based on the name
    const user = await prisma.user.findUnique({
      where: {
        name: name,  // assuming the user model has a 'name' field
      },
    });

    if (!user) {
      return NextResponse.json({ status: 404, statusText: 'User not found' });
    }

    // Fetch games associated with the user's ID
    const games = await prisma.game.findMany({
      where: {
        userId: user.id,
      },
    });

    
    if (!games || games.length === 0) {
      return NextResponse.json({ status: 404, statusText: 'Games not found for the user' });
    }

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ status: 500, statusText: 'Internal Server Error' });
  }
}
