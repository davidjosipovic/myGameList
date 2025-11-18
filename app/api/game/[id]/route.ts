// pages/api/games.ts

import { NextResponse } from "next/server";
import { igdbClient } from "@/lib/igdb";

// In-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache

export async function POST(req: Request,{ params }: { params: { id: string }}) {
  const id = params.id;
  if (req.method !== 'POST') {
    return NextResponse.json({ error: "error" }, { status: 405 });  // Method Not Allowed if not POST
  }

  try {
    // Check cache first
    const cached = cache.get(id);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json({ data: cached.data }, { status: 200 });
    }

    const data = await igdbClient.request(
      'games',
      `fields name,rating,rating_count,cover.url,summary,screenshots.url, involved_companies.company.name, videos.video_id, standalone_expansions.name, platforms.name, genres.name, game_modes.name, first_release_date; where id=${id};`
    );

    // Store in cache
    cache.set(id, { data, timestamp: Date.now() });

    // Clean old cache entries (simple cleanup)
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    return NextResponse.json({ data }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
