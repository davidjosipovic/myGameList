// pages/api/games.ts

import { NextResponse } from "next/server";
import { igdbClient } from "@/lib/igdb";

export async function GET(req: Request,) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: "error" }, { status: 405 });  // Method Not Allowed if not GET
  }

  try {
    const data = await igdbClient.request(
      'games',
      "fields id,name,rating,rating_count,cover.url; sort rating desc; limit 100; where rating_count>100 & version_parent = null;"
    );

    return  NextResponse.json({ data }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
