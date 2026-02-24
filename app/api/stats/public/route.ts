import { NextResponse } from "next/server";
import { igdbClient } from "@/lib/igdb";

export async function GET() {
  try {
    // Dohvati top ocijenjene igre s IGDB-a (bez DLC-ova i expansiona)
    const topRatedGames = await igdbClient.request(
      'games',
      `fields name,rating,rating_count; 
       where rating != null & rating_count > 100 & version_parent = null; 
       sort rating desc; 
       limit 8;`
    );

    // Dohvati najpopularnije igre (najviše ocjena, bez DLC-ova i expansiona)
    const popularGames = await igdbClient.request(
      'games',
      `fields name,rating,rating_count; 
       where rating_count != null & version_parent = null; 
       sort rating_count desc; 
       limit 8;`
    );

    // Kombiniraj i kreiraj statistiku
    const allGames = [...topRatedGames, ...popularGames];
    
    // Ukloni duplikate
    const uniqueGames = Array.from(
      new Map(allGames.map(game => [game.id, game])).values()
    );

    // Foratiraj podatke za D3.js
    const gameStats = uniqueGames
      .filter(game => game.rating && game.rating_count)
      .map(game => ({
        name: game.name,
        rating: Number((game.rating / 10).toFixed(1)), // Konvertiraj iz 0-100 u 0-10
        plays: game.rating_count, // Koristimo rating_count kao "plays"
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);

    return NextResponse.json(gameStats);
  } catch (error) {
    console.error("Error fetching IGDB stats:", error);
    return NextResponse.json(
      { error: 'IGDB temporarily unavailable' },
      { status: 503 }
    );
  }
}
