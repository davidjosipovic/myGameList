// Utility functions for platform-related operations

import { igdbClient } from "./igdb";

const platformCache = new Map<string, number | null>();

export async function fetchPlatformId(platformName: string): Promise<number | null> {
  const platformMapping: Record<string, number> = {
    "pc": 6,
    "psp": 38,
    "playstation portable": 38,
    "ps1": 7,
    "ps2": 8,
    "ps3": 9,
    "ps4": 48,
    "ps5": 167,
    "playstation": 167,
    "playstation 5": 167,
    "xbox": 11,
    "xbox 360": 12,
    "xbox one": 49,
    "xbox series x": 169,
    "xbox series": 169,
    "nintendo switch": 130,
    "switch": 130,
    "ios": 39,
    "android": 34
  };

  const normalizedPlatformName = platformName.toLowerCase();
  
  // Check mapping first
  const platformId = platformMapping[normalizedPlatformName];
  if (platformId) {
    return platformId;
  }

  // Check cache
  if (platformCache.has(normalizedPlatformName)) {
    return platformCache.get(normalizedPlatformName)!;
  }

  try {
    const data = await igdbClient.request('platforms', `
      fields id;
      where name ~ *"${platformName}"*;
      limit 1;
    `);

    const fetchedPlatformId = data[0]?.id || null;

    // Cache the result
    platformCache.set(normalizedPlatformName, fetchedPlatformId);
    return fetchedPlatformId;
  } catch (error) {
    console.error(`Error fetching platform ID for ${platformName}:`, error);
    platformCache.set(normalizedPlatformName, null);
    return null;
  }
}
