import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { igdbClient } from "@/lib/igdb";

const prisma = new PrismaClient();

// TEMPORARILY DISABLED - In-memory cache for recent games
// const cache = new Map<string, { data: any; timestamp: number }>();
// const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache for recent games

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const name = params.id;

  try {
    // TEMPORARILY DISABLED - Check cache first
    // const cached = cache.get(name);
    // if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    //   return NextResponse.json(cached.data);
    // }

    // Fetch the user based on the name
    const user = await prisma.user.findUnique({
      where: {
        name: name,
      },
    });

    if (!user) {
      return NextResponse.json({ status: 404, statusText: 'User not found' });
    }

    // Fetch last 5 games from database
    const userGames = await prisma.game.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        id: 'desc', // Get most recent additions
      },
      take: 5,
    });

    if (!userGames || userGames.length === 0) {
      const emptyResult = [];
      // cache.set(name, { data: emptyResult, timestamp: Date.now() });
      return NextResponse.json(emptyResult);
    }

    // Batch fetch all game details from IGDB in one request
    const gameIds = userGames.map(game => game.gameId).join(',');
    
    console.log('Fetching recent games with IDs:', gameIds);
    
    const gamesData = await igdbClient.request(
      'games',
      `fields name,rating,rating_count,cover.url; where id=(${gameIds});`
    );

    console.log('IGDB returned games:', gamesData.length);

    // Combine user game data with IGDB data
    const recentGamesWithDetails = userGames.map(userGame => {
      const gameDetails = gamesData.find(g => g.id === userGame.gameId);
      return {
        ...userGame,
        gameDetails: gameDetails || null,
      };
    }).filter(game => game.gameDetails !== null);

    console.log('Final recent games:', recentGamesWithDetails.length);

    // TEMPORARILY DISABLED - Store in cache
    // cache.set(name, { data: recentGamesWithDetails, timestamp: Date.now() });

    // TEMPORARILY DISABLED - Clean old cache entries
    // if (cache.size > 50) {
    //   const oldestKey = cache.keys().next().value;
    //   cache.delete(oldestKey);
    // }

    return NextResponse.json(recentGamesWithDetails);
  } catch (error) {
    console.error("Error fetching recent games:", error);
    return NextResponse.json({ status: 500, statusText: 'Internal Server Error' });
  }
}
