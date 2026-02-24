'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
      <div className="flex gap-4 mb-8 lg:mb-12 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-green-light scrollbar-track-grey-dark">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-28 h-40 md:w-44 md:h-64 lg:w-64 lg:h-96 bg-grey-dark animate-pulse rounded-lg border-2 border-white/20" />
          </div>
        ))}
      </div>
    );
  }

  if (error === 'LOGIN_REQUIRED' || error || games.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-4 mb-8 lg:mb-12 overflow-x-auto pb-4 scroll-smooth scrollbar-thin scrollbar-thumb-green-light scrollbar-track-grey-dark px-2">
      <div className="flex gap-4 lg:gap-6">
        {games.map((game) => (
          <Link key={game.gameId} href={`/game/${game.gameId}`} className="flex-shrink-0 group">
            <div className="relative w-28 h-40 md:w-44 md:h-64 lg:w-64 lg:h-96 transition-transform duration-300 ease-out">
              {game.coverUrl ? (
                <Image
                  src={game.coverUrl}
                  alt={game.name}
                  fill
                  className="w-full h-full object-cover rounded-lg border-2 border-white/20 group-hover:border-green-light transition-all duration-300 shadow-xl"
                  sizes="(max-width: 768px) 112px, (max-width: 1024px) 176px, 256px"
                />
              ) : (
                <div className="w-full h-full rounded-lg border-2 border-white/20 bg-grey-dark flex items-center justify-center">
                  <span className="text-white/20 text-xs">No Cover</span>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-end p-3 lg:p-4">
                <p className="text-white text-sm md:text-base lg:text-lg font-bold drop-shadow-lg">
                  {game.name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
