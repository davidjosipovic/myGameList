import { NextResponse } from "next/server";
import { igdbClient } from "@/lib/igdb";

export async function GET() {
  try {
    // Dohvati top ocijenjene igre s IGDB-a
    const topRatedGames = await igdbClient.request(
      'games',
      `fields name,rating,rating_count; 
       where rating != null & rating_count > 100; 
       sort rating desc; 
       limit 8;`
    );

    // Dohvati najpopularnije igre (najviše ocjena)
    const popularGames = await igdbClient.request(
      'games',
      `fields name,rating,rating_count; 
       where rating_count != null; 
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
    
    // Fallback podaci u slučaju greške
    const fallbackData = [
      { name: 'The Witcher 3', rating: 9.5, plays: 15234 },
      { name: 'Elden Ring', rating: 9.2, plays: 18456 },
      { name: 'Baldur\'s Gate 3', rating: 9.7, plays: 12890 },
      { name: 'Red Dead Redemption 2', rating: 9.3, plays: 16543 },
      { name: 'God of War', rating: 9.4, plays: 13245 },
      { name: 'Cyberpunk 2077', rating: 8.5, plays: 11234 },
    ];
    
    return NextResponse.json(fallbackData);
  }
}
