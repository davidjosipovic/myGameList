import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { igdbClient } from "@/lib/igdb";

const prisma = new PrismaClient();

// TEMPORARILY DISABLED - In-memory cache for full gamelists
// const cache = new Map<string, { data: any; timestamp: number }>();
// const CACHE_TTL = 1000 * 60 * 10; // 10 minutes cache for full lists

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

    // Fetch all games from database
    const userGames = await prisma.game.findMany({
      where: {
        userId: user.id,
      },
    });

    if (!userGames || userGames.length === 0) {
      return NextResponse.json([]);
    }

    // Batch fetch all game details from IGDB in one request
    const gameIds = userGames.map(game => game.gameId).join(',');
    
    console.log('Fetching games with IDs:', gameIds);
    
    const gamesData = await igdbClient.request(
      'games',
      `fields name,rating,rating_count,cover.url; where id=(${gameIds});`
    );

    console.log('IGDB returned games:', gamesData.length);

    // Combine user game data with IGDB data
    const gamesWithDetails = userGames.map(userGame => {
      const gameDetails = gamesData.find(g => g.id === userGame.gameId);
      if (!gameDetails) {
        console.log('No match found for gameId:', userGame.gameId);
        return null;
      }
      
      return {
        ...gameDetails,
        status: userGame.status,
        userRating: userGame.rating,
        dbId: userGame.id, // Keep the database ID for deletion
      };
    }).filter(game => game !== null);

    console.log('Final games with details:', gamesWithDetails.length);

    // TEMPORARILY DISABLED - Store in cache
    // cache.set(name, { data: gamesWithDetails, timestamp: Date.now() });

    // TEMPORARILY DISABLED - Clean old cache entries
    // if (cache.size > 50) {
    //   const oldestKey = cache.keys().next().value;
    //   cache.delete(oldestKey);
    // }

    return NextResponse.json(gamesWithDetails);
  } catch (error) {
    console.error("Error fetching all games:", error);
    return NextResponse.json({ status: 500, statusText: 'Internal Server Error' });
  }
}
