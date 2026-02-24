/**
 * Content-based Recommendation Engine – Cosine Similarity
 *
 * Uspoređuje žanrove i ocjene igara iz korisnikove liste s kandidatima
 * iz IGDB-a i rangira ih po sličnosti.
 */

import prisma from '@/lib/prisma';
import { igdbClient } from '@/lib/igdb';

// ────────────────────────────────────────────────────────────
// Tipovi
// ────────────────────────────────────────────────────────────
interface IGDBGame {
  id: number;
  name: string;
  genres?: { id: number; name: string }[];
  rating?: number;
  rating_count?: number;
  cover?: { id: number; url: string };
  summary?: string;
}

export interface RecommendedGame {
  gameId: number;
  name: string;
  coverUrl: string | null;
  rating: number;
  similarity: number;        // 0-1, cosine similarity skor
  matchedGenres: string[];   // žanrovi koji se podudaraju
  summary: string | null;
}

// ────────────────────────────────────────────────────────────
// Svi mogući IGDB žanrovi (fiksni set za vektorski prostor)
// ────────────────────────────────────────────────────────────
const ALL_GENRE_IDS = [
  2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 24, 25, 26, 30, 31, 32, 33, 34, 35, 36,
];

// ────────────────────────────────────────────────────────────
// Matematičke pomoćne funkcije
// ────────────────────────────────────────────────────────────

/** Skalarni produkt dvaju vektora */
function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

/** Euklidska norma vektora */
function magnitude(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

/**
 * Cosine Similarity između dva vektora.
 * Vraća 0 ako je jedan od vektora nulti.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

// ────────────────────────────────────────────────────────────
// Vektorizacija igre
// ────────────────────────────────────────────────────────────

/**
 * Pretvara igru u feature-vektor:
 *   [genre_1_present, genre_2_present, ..., normalised_rating]
 *
 * žanrovi su one-hot (0/1), rating je normaliziran na 0-1 (IGDB skala 0-100).
 */
function gameToVector(genreIds: number[], rating: number): number[] {
  const genreFeatures = ALL_GENRE_IDS.map((gid) => (genreIds.includes(gid) ? 1 : 0));
  const normRating = Math.min(1, Math.max(0, rating / 100));
  return [...genreFeatures, normRating];
}

// ────────────────────────────────────────────────────────────
// Korisnikov profil-vektor (prosjek svih igara u listi)
// ────────────────────────────────────────────────────────────

function buildUserProfile(games: { genreIds: number[]; rating: number }[]): number[] {
  if (games.length === 0) return new Array(ALL_GENRE_IDS.length + 1).fill(0);

  const vectors = games.map((g) => gameToVector(g.genreIds, g.rating));
  const dim = vectors[0].length;
  const avg = new Array(dim).fill(0);

  for (const v of vectors) {
    for (let i = 0; i < dim; i++) avg[i] += v[i];
  }
  for (let i = 0; i < dim; i++) avg[i] /= vectors.length;
  return avg;
}

// ────────────────────────────────────────────────────────────
// Javni API – generiraj preporuke za korisnika
// ────────────────────────────────────────────────────────────

export async function getRecommendations(
  userId: string,
  limit: number = 10,
): Promise<RecommendedGame[]> {
  // 1. Dohvati korisnikovu listu igara iz baze
  const userGames = await prisma.game.findMany({
    where: { userId },
    select: { gameId: true, rating: true },
  });

  if (userGames.length === 0) {
    return [];
  }

  const userGameIds = new Set(userGames.map((g) => g.gameId));

  // 2. Dohvati detalje korisnikovih igara s IGDB-a (žanrovi)
  const igdbIds = userGames.map((g) => g.gameId);
  let userIGDBGames: IGDBGame[] = [];
  try {
    userIGDBGames = await igdbClient.request(
      'games',
      `fields id, name, genres.id, genres.name, rating;
       where id = (${igdbIds.join(',')});
       limit ${igdbIds.length};`,
    );
  } catch (err) {
    console.error('[Recommender] Error fetching user games from IGDB:', err);
    return [];
  }

  // Mapiraj IGDB podatke s korisnikovim ocjenama
  const userGameData = userIGDBGames.map((ig) => {
    const userEntry = userGames.find((ug) => ug.gameId === ig.id);
    return {
      genreIds: ig.genres?.map((g) => g.id) || [],
      // Koristi korisnikovu ocjenu (1-10 → 0-100) ili IGDB rating
      rating: userEntry?.rating ? userEntry.rating * 10 : ig.rating || 50,
    };
  });

  // 3. Izgradi korisnikov profil-vektor
  const userProfile = buildUserProfile(userGameData);

  // 4. Dohvati kandidate – top igre iz najčešćih korisnikovih žanrova
  const genreCount = new Map<number, number>();
  for (const g of userGameData) {
    for (const gid of g.genreIds) {
      genreCount.set(gid, (genreCount.get(gid) || 0) + 1);
    }
  }

  const topGenres = Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  if (topGenres.length === 0) topGenres.push(12); // fallback: RPG

  let candidates: IGDBGame[] = [];
  try {
    candidates = await igdbClient.request(
      'games',
      `fields id, name, genres.id, genres.name, rating, rating_count, cover.url, summary;
       where genres = (${topGenres.join(',')})
         & rating_count > 20
         & rating != null
         & version_parent = null;
       sort rating desc;
       limit 50;`,
    );
  } catch (err) {
    console.error('[Recommender] Error fetching candidate games from IGDB:', err);
    return [];
  }

  // 5. Filtriraj igre koje korisnik već ima i izračunaj sličnost
  const genreIdToName = new Map<number, string>();
  for (const c of candidates) {
    for (const g of c.genres || []) {
      genreIdToName.set(g.id, g.name);
    }
  }
  for (const ig of userIGDBGames) {
    for (const g of ig.genres || []) {
      genreIdToName.set(g.id, g.name);
    }
  }

  const scored: RecommendedGame[] = candidates
    .filter((c) => !userGameIds.has(c.id))
    .map((c) => {
      const genreIds = c.genres?.map((g) => g.id) || [];
      const candidateVector = gameToVector(genreIds, c.rating || 50);
      const similarity = cosineSimilarity(userProfile, candidateVector);

      // Nađi podudarajuće žanrove
      const userGenreSet = new Set(userGameData.flatMap((g) => g.genreIds));
      const matchedGenres = genreIds
        .filter((gid) => userGenreSet.has(gid))
        .map((gid) => genreIdToName.get(gid) || `Genre ${gid}`);

      return {
        gameId: c.id,
        name: c.name,
        coverUrl: c.cover?.url
          ? `https:${c.cover.url.replace('t_thumb', 't_cover_big')}`
          : null,
        rating: c.rating ? Number((c.rating / 10).toFixed(1)) : 0,
        similarity: Number(similarity.toFixed(4)),
        matchedGenres: Array.from(new Set(matchedGenres)),
        summary: c.summary ?? null,
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return scored;
}
