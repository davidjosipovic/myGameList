import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Game = {
  id: number;
  cover: { id: number; url: string };
  name: string;
};

export default function HomeCarousel({ filter }: { filter: string }) {
  const [data, setData] = useState<Game[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const MAX_ATTEMPTS = 8;
    const POLL_INTERVAL = 5000;
    let attempt = 0;

    const fetchGames = async () => {
      attempt++;
      try {
        const response = await fetch(`/api/games/${filter}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        if (!cancelled) {
          setData(json.data);
          setLoading(false);
          setError(false);
        }
      } catch {
        if (attempt < MAX_ATTEMPTS && !cancelled) {
          timer = setTimeout(fetchGames, POLL_INTERVAL);
          return;
        }
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    setLoading(true);
    setError(false);
    fetchGames();

    return () => { cancelled = true; clearTimeout(timer); };
  }, [filter]);

  if (loading) {
    return (
      <div className="flex gap-4 mb-8 lg:mb-12 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-green-light scrollbar-track-grey-dark">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="flex-shrink-0">
            <div className="w-24 h-36 md:w-40 md:h-60 lg:w-60 lg:h-80 bg-grey-dark animate-pulse rounded-lg border-2 border-white/20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-white/70">
        <p>Failed to load games. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 mb-8 lg:mb-12 overflow-x-auto pb-4 scroll-smooth scrollbar-thin scrollbar-thumb-green-light scrollbar-track-grey-dark px-2">
      <div className="flex gap-4 lg:gap-6">
        {data?.slice(0, 10).map((game, index) => (
          <Link key={game.id} href={`/game/${game.id}`} className="flex-shrink-0 group">
            <div className="relative w-28 h-40 md:w-44 md:h-64 lg:w-64 lg:h-96 transition-transform duration-300 ease-out">
              <Image 
                height={500} 
                width={500} 
                src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`} 
                alt={`${game.name} cover`} 
                className="w-full h-full object-cover rounded-lg border-2 border-white/20 group-hover:border-green-light transition-all duration-300 shadow-xl"
              />
              {/* Overlay with game name */}
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
