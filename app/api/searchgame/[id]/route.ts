// pages/api/games.ts

import { NextResponse } from "next/server";
import { igdbClient } from "@/lib/igdb";


export async function POST(req: Request,{ params }: { params: { id: string }}) {
    const id = params.id;
  if (req.method !== 'POST') {
    return NextResponse.json({ error: "error" }, { status: 405 });  // Method Not Allowed if not POST
  }

  try {
    console.log('Searching for:', id);
    const data = await igdbClient.request(
      'games',
      `fields id, name, cover.url; search "${id}"; limit 6; where version_parent = null;`
    );
    
    console.log('Search results:', data);
    return  NextResponse.json({ data }, { status: 200 });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
