// Utility functions for searching games in IGDB

import { fetchPlatformId } from "./platformUtils";
import { fetchGenreId } from "./genreUtils";
import { igdbClient } from "./igdb";

interface GameSearchParams {
  platform: string[];
  genre: string[];
  similarGame: string | null;
}

interface GameResult {
  name: string;
}

export async function fetchGamesFromIGDB({ 
  platform, 
  genre, 
  similarGame 
}: GameSearchParams): Promise<GameResult[]> {

  // Case 1: Search based on similar game
  if (similarGame) {
    try {
      const similarGameData = await igdbClient.request('games', `
        fields similar_games;
        search "${similarGame}";
        limit 1;
      `);
    
      const similarGameIds = similarGameData[0]?.similar_games || [];
    
      if (similarGameIds.length) {
        const platformIds = platform.length > 0 ? await Promise.all(platform.map(fetchPlatformId)) : [];
        const validPlatformIds = platformIds.filter(id => id !== null);
    
        const genreIds = genre.length > 0 ? await Promise.all(genre.map(fetchGenreId)) : [];
        const validGenreIds = genreIds.filter(id => id !== null);
    
        const platformConditions = validPlatformIds.length
          ? validPlatformIds.map(id => `platforms = (${id})`).join(" & ")
          : null;
    
        const genreConditions = validGenreIds.length
          ? validGenreIds.map(id => `genres = (${id})`).join(" & ")
          : null;
    
        const combinedConditions = [
          `id = (${similarGameIds.join(",")})`,
          platformConditions,
          genreConditions,
        ]
          .filter(condition => condition !== null)
          .join(" & ");
    
        const filteredGamesData = await igdbClient.request('games', `
          fields name;
          where ${combinedConditions};
          sort rating desc;
          limit 10;
        `);
  
        return filteredGamesData.map((game: any) => ({
          name: game.name,
        }));
      }
    } catch (error) {
      console.error("Error in similar game search:", error);
      // Continue to other search methods
    }
  }

  // Case 2: Search by genre only
  if (genre.length > 0 && platform.length === 0 && !similarGame) {
    const genreIds = await Promise.all(genre.map(fetchGenreId));
    const validGenreIds = genreIds.filter(id => id !== null);

    if (validGenreIds.length) {
      const genreConditions = validGenreIds.map(id => `genres = (${id})`).join(" & ");
      console.log("Genre conditions:", genreConditions);
      
      const gamesData = await igdbClient.request('games', `
        fields name;
        where ${genreConditions} & rating != null & rating_count >= 40 & version_parent = null;
        sort rating desc;
        limit 10;
      `);

      return gamesData.map((game: any) => ({
        name: game.name,
      }));
    }
  }

  // Case 3: Search by platform only
  if (platform.length > 0 && genre.length === 0 && !similarGame) {
    console.log("Platform:", platform);
    const platformIds = await Promise.all(platform.map(fetchPlatformId));
    console.log("Platform IDs:", platformIds);
    const validPlatformIds = platformIds.filter(id => id !== null);

    if (validPlatformIds.length) {
      const platformConditions = validPlatformIds.map(id => `platforms = (${id})`).join(" & ");
      console.log("Platform conditions:", platformConditions);
      
      const gamesData = await igdbClient.request('games', `
        fields name;
        where ${platformConditions} & rating != null & rating_count >= 40 & version_parent = null;
        sort rating desc;
        limit 10;
      `);

      return gamesData.map((game: any) => ({
        name: game.name,
      }));
    }
  }

  // Case 4: Search by both platform and genre
  if (platform.length > 0 && genre.length > 0 && !similarGame) {
    console.log("Platform:", platform);
    console.log("Genre:", genre);
    const platformIds = await Promise.all(platform.map(fetchPlatformId));
    const validPlatformIds = platformIds.filter(id => id !== null);
  
    const genreIds = await Promise.all(genre.map(fetchGenreId));
    const validGenreIds = genreIds.filter(id => id !== null);
  
    if (validPlatformIds.length && validGenreIds.length) {
      const platformConditions = validPlatformIds.map(id => `platforms = (${id})`).join(" & ");
      const genreConditions = validGenreIds.map(id => `genres = (${id})`).join(" & ");
  
      const combinedConditions = `${platformConditions} & ${genreConditions}`;
  
      const gamesData = await igdbClient.request('games', `
        fields name;
        where ${combinedConditions} & rating != null & rating_count >= 40 & version_parent = null;
        sort rating desc;
        limit 10;
      `);

      return gamesData.map((game: any) => ({
        name: game.name,
      }));
    }
  }

  // Fallback: Return popular games if nothing else matched
  try {
    const gamesData = await igdbClient.request('games', `
      fields name;
      where rating != null & rating_count >= 100 & version_parent = null;
      sort rating desc;
      limit 10;
    `);

    return gamesData.map((game: any) => ({
      name: game.name,
    }));
  } catch (error) {
    console.error("Fallback search failed:", error);
  }

  return [];
}
