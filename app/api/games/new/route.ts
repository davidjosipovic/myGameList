
import { NextResponse } from "next/server";
import { igdbClient } from "@/lib/igdb";

export async function GET(req: Request,) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: "error" }, { status: 405 });  // Method Not Allowed if not GET
  }

  try {
    const data = await igdbClient.request(
      'games',
      "fields name, first_release_date, rating_count, cover.url; where first_release_date>1704063600 & rating_count>10; sort first_release_date desc; limit 10;"
    );

    return  NextResponse.json({ data }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
