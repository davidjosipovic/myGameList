import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, gameid: string } }
) {
  const gameIdToDelete = parseInt(params.gameid, 10); // Convert the string to a number
  const name = params.id;

  try {
    // Fetch the user based on the name
    const user = await prisma.user.findUnique ({
      where: {
        name: name,  // assuming the user model has a 'name' field
      },
    });

    if (!user) {
      return NextResponse.json({ status: 404, statusText: 'User not found' });
    }

    // Find the game by gameId and userId
    const gameToDelete = await prisma.game.findFirst({
      where: {
        gameId: gameIdToDelete,
        userId: user.id,
      },
    });

    if (!gameToDelete) {
      return NextResponse.json({ status: 404, statusText: 'Game not found' });
    }

    // Delete the game
    const deletedGame = await prisma.game.delete({
      where: {
        id: gameToDelete.id,
      },
    });

    return NextResponse.json(deletedGame);
  } catch (error) {
    console.error("Error deleting a game:", error);
    return NextResponse.json({ status: 500, statusText: 'Internal Server Error' });
  }
}
