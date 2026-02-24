'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnalysisCard from '@/components/AnalysisCard';

interface RecommendedGame {
  gameId: number;
  name: string;
  coverUrl: string | null;
  rating: number;
  similarity: number;
  matchedGenres: string[];
  summary: string | null;
}

export default function RecommendationsSection() {
  const [games, setGames] = useState<RecommendedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/recommendations')
      .then((res) => {
        if (res.status === 401) throw new Error('LOGIN_REQUIRED');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-grey-dark border border-white/20 rounded-lg p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-light mx-auto mb-3" />
          <p className="text-white/60 text-sm">Računanje preporuka (Cosine Similarity)...</p>
        </div>
      </div>
    );
  }

  if (error === 'LOGIN_REQUIRED') {
    return (
      <div className="bg-grey-dark border border-white/20 rounded-lg p-6 text-center">
        <p className="text-white/70 mb-2">Prijavi se kako bi dobio personalizirane preporuke.</p>
        <Link
          href="/login"
          className="inline-block bg-green-light text-grey-dark font-bold px-6 py-2 rounded-lg hover:bg-green-dark transition-colors"
        >
          Prijava
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-grey-dark border border-white/20 rounded-lg p-6 text-center">
        <p className="text-red font-bold mb-1">Greška pri dohvaćanju preporuka</p>
        <p className="text-white/50 text-sm">{error}</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="bg-grey-dark border border-white/20 rounded-lg p-6 text-center">
        <p className="text-white/70">
          Dodaj barem par igara u svoju listu kako bi sustav mogao izračunati preporuke.
        </p>
      </div>
    );
  }

  const avgSimilarity = (games.reduce((s, g) => s + g.similarity, 0) / games.length).toFixed(3);
  const allGenres = Array.from(new Set(games.flatMap((g) => g.matchedGenres)));
  const topGenres = allGenres.slice(0, 5).join(', ') || 'N/A';

  return (
    <div className="space-y-6">
      {/* Game cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {games.map((game) => (
          <Link
            key={game.gameId}
            href={`/game/${game.gameId}`}
            className="group bg-grey-dark border border-white/10 rounded-lg overflow-hidden hover:border-green-light/50 transition-colors"
          >
            {/* Cover */}
            <div className="relative aspect-[3/4] bg-grey-light">
              {game.coverUrl ? (
                <Image
                  src={game.coverUrl}
                  alt={game.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                  No Cover
                </div>
              )}

              {/* Similarity badge */}
              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-green-light text-xs font-mono px-2 py-1 rounded">
                {(game.similarity * 100).toFixed(1)}%
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="text-white text-sm font-semibold truncate group-hover:text-green-light transition-colors">
                {game.name}
              </h3>

              {game.rating > 0 && (
                <p className="text-white/50 text-xs mt-1">
                  ⭐ {game.rating.toFixed(1)}
                </p>
              )}

              {game.matchedGenres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {game.matchedGenres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="text-[10px] bg-green-light/10 text-green-light px-1.5 py-0.5 rounded"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Analysis card */}
      <AnalysisCard
        title="Cosine Similarity Preporuke — Rezultat"
        result={
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-1 text-green-light">Metrika</th>
                <th className="text-right py-1 text-green-light">Vrijednost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="py-1">Broj preporuka</td>
                <td className="text-right font-mono">{games.length}</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-1">Prosječna sličnost</td>
                <td className="text-right font-mono">{avgSimilarity}</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-1">Algoritam</td>
                <td className="text-right font-mono">Cosine Similarity</td>
              </tr>
              <tr>
                <td className="py-1">Dominantni žanrovi</td>
                <td className="text-right font-mono">{topGenres}</td>
              </tr>
            </tbody>
          </table>
        }
        interpretation={`Sustav preporuka koristi Cosine Similarity za usporedbu vektora žanrova i ocjena korisnikovih igara s kandidatima iz IGDB baze. Prosječna sličnost od ${avgSimilarity} ukazuje na ${Number(avgSimilarity) > 0.7 ? 'visoku' : Number(avgSimilarity) > 0.4 ? 'srednju' : 'nisku'} podudarnost — dominantni žanrovi u profilu korisnika su ${topGenres}. Svaka preporuka je rangirana po cosine skoru između korisnikovog profilnog vektora i vektora kandidata.`}
        uxImplication="Personalizirane preporuke povećavaju angažiranost korisnika jer smanjuju trud potreban za pronalazak zanimljivih igara. Prijedlog: dodati 'Recommended for you' sekciju na homepage, integrirati preporuke u search rezultate kao boosted rezultate, te koristiti preporuke za re-engagement email kampanje."
      />
    </div>
  );
}
