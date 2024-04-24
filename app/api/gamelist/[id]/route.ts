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


export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const name = params.id;
  const body = await request.json();

  try {
    // Fetch the user based on the name
    const user = await prisma.user.findUnique({
      where: {
        name: name,
      },
    });

    if (!user) {
      return NextResponse.json({ status: 404, statusText: 'User not found' });
    }

    // Check if the game already exists for the user
    const existingGame = await prisma.game.findFirst({
      where: {
        AND: [
          { userId: user.id },
          { gameId: parseInt(body.gameId, 10) },
        ],
      },
    });

    if (existingGame) {
     console.log("This game already exists in the database.")

    } else {
      // Create a new game
      const newGame = await prisma.game.create({
        data: {
          gameId: parseInt(body.gameId, 10),
          rating: body.rating, // Include the rating from the request
          review: body.review,
          status: body.status,
          userId: user.id,
        },
      });

      return NextResponse.json(newGame);
    }
  } catch (error) {
    console.error("Error adding/updating a game:", error);
    return NextResponse.json({ status: 500, statusText: 'Internal Server Error' });
  }
}


export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const name = params.id;
  const body = await request.json();

  try {
    // Fetch the user based on the name
    const user = await prisma.user.findUnique({
      where: {
        name: name,
      },
    });

    if (!user) {
      return NextResponse.json({ status: 404, statusText: 'User not found' });
    }

    // Check if the game already exists for the user
    const existingGame = await prisma.game.findFirst({
      where: {
        AND: [
          { userId: user.id },
          { gameId: parseInt(body.gameId, 10) },
        ],
      },
    });

    if (existingGame) {
      // Update the existing game
      const updatedGame = await prisma.game.update({
        where: { id: existingGame.id },
        data: {
          rating: body.rating,
          review: body.review,
          status: body.status,
        },
      });

      return NextResponse.json(updatedGame);
    } else {
      console.log("This game doesnt exist in the database.")
    }
  } catch (error) {
    console.error("Error adding/updating a game:", error);
    return NextResponse.json({ status: 500, statusText: 'Internal Server Error' });
  }
}
