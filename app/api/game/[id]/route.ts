// pages/api/games.ts

import { NextResponse } from "next/server";



export async function POST(req: Request,{ params }: { params: { id: string }}) {
  const id = params.id;
  if (req.method !== 'POST') {
    return NextResponse.json({ error: "error" }, { status: 405 });  // Method Not Allowed if not POST
  }

  try {
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST', 
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.CLIENT_ID ,
        'Authorization': process.env.BEARER_ACCESS_TOKEN
      },
      body: `fields name,rating,rating_count,cover.url,summary,screenshots.url, involved_companies.company.name, videos.video_id, standalone_expansions.name, platforms.name, genres.name, game_modes.name, first_release_date; where id=${id};`
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error fetching from IGDB API');
    }

    return  NextResponse.json({ data }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
