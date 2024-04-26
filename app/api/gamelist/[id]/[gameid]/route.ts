import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string; gameid: string } }) {
  const userId = params.id


  const gameId = parseInt(params.gameid, 10); // Parse gameId as an integer

  try {
    // Fetch the user based on the ID
    const user = await prisma.user.findUnique({
      where: {
        name: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ status: 404, statusText: "User not found" });
    }

    // Check if the game exists for the user
    const game = await prisma.game.findFirst({
      where: {
        userId: user.id,
        gameId: gameId, // Use gameId as an integer
      },
    });

    if (!game) {
      return NextResponse.json({ status: 404, statusText: "Game not found for the user" });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json({ status: 500, statusText: "Internal Server Error" });
  }
}
