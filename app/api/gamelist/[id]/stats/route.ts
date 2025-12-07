import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { igdbClient } from "@/lib/igdb";

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
        name: name,
      },
    });

    if (!user) {
      return NextResponse.json({ status: 404, statusText: 'User not found' });
    }

    // Fetch all user's games from database
    const userGames = await prisma.game.findMany({
      where: {
        userId: user.id,
      },
    });

    if (!userGames || userGames.length === 0) {
      return NextResponse.json([]);
    }

    // Get unique game IDs
    const gameIds = userGames.map(game => game.gameId).join(',');
    
    // Fetch game details from IGDB
    const gamesData = await igdbClient.request(
      'games',
      `fields name,rating; where id=(${gameIds});`
    );

    // Calculate statistics for each game
    const gameStats = userGames.map(userGame => {
      const gameDetails = gamesData.find(g => g.id === userGame.gameId);
      if (!gameDetails) {
        return null;
      }
      
      // Count how many times this game appears (plays)
      const plays = userGames.filter(g => g.gameId === userGame.gameId).length;
      
      // Use user rating if available, otherwise use IGDB rating (convert from 0-100 to 0-10)
      const rating = userGame.rating 
        ? userGame.rating / 10 
        : gameDetails.rating 
        ? gameDetails.rating / 10 
        : 0;
      
      return {
        name: gameDetails.name,
        rating: Number(rating.toFixed(1)),
        plays: plays,
      };
    }).filter(game => game !== null);

    // Remove duplicates (keep unique games)
    const uniqueGames = Array.from(
      new Map(gameStats.map(item => [item.name, item])).values()
    );

    // Sort by rating descending and limit to top 15 for better visualization
    const topGames = uniqueGames
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 15);

    return NextResponse.json(topGames);
  } catch (error) {
    console.error("Error fetching game stats:", error);
    return NextResponse.json({ status: 500, statusText: 'Internal Server Error', error: error.message });
  }
}
