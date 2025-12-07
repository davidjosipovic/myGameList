// Utility functions for genre-related operations

import { igdbClient } from "./igdb";

const genreCache = new Map<string, number | null>();

export async function fetchGenreId(genreName: string): Promise<number | null> {
  const genreMapping: Record<string, number> = {
    "point and click": 2,
    "point-and-click": 2,
    "fighting": 4,
    "shooter": 5,
    "music": 7,
    "platform": 8,
    "platformer": 8,
    "puzzle": 9,
    "racing": 10,
    "real time strategy": 11,
    "rts": 11,
    "role playing": 12,
    "rpg": 12,
    "role-playing": 12,
    "simulator": 13,
    "simulation": 13,
    "sport": 14,
    "sports": 14,
    "strategy": 15,
    "turn based strategy": 16,
    "tbs": 16,
    "turn-based strategy": 16,
    "tactical": 24,
    "hack and slash": 25,
    "beat 'em up": 25,
    "quiz": 26,
    "trivia": 26,
    "pinball": 30,
    "adventure": 31,
    "indie": 32,
    "arcade": 33,
    "visual novel": 34,
    "card and board game": 35,
    "card game": 35,
    "board game": 35,
    "moba": 36
  };

  const normalizedGenreName = genreName.toLowerCase().trim();
  
  // Check mapping first
  const genreId = genreMapping[normalizedGenreName];
  if (genreId) {
    console.log(`Genre "${genreName}" mapped to ID: ${genreId}`);
    return genreId;
  }

  // Check cache
  if (genreCache.has(normalizedGenreName)) {
    return genreCache.get(normalizedGenreName)!;
  }

  try {
    const data = await igdbClient.request('genres', `
      fields id, name, slug;
      search "${genreName}";
      limit 1;
    `);

    console.log(`IGDB genre search for "${genreName}":`, data);

    const fetchedGenreId = data[0]?.id || null;

    // Cache the result
    genreCache.set(normalizedGenreName, fetchedGenreId);
    return fetchedGenreId;
  } catch (error) {
    console.error(`Error fetching genre ID for ${genreName}:`, error);
    genreCache.set(normalizedGenreName, null);
    return null;
  }
}
