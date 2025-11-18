'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Dropdown from './Dropdown';

type Game = {
  id: number;
  name: string;
  rating: number;
  rating_count: number;
  cover: { id: number; url: string };
};
interface GameListProps {
  params: {
    id: string;
  };
}

const GameComponent: React.FC<GameListProps> = ({params}) => {
  const [id,setId]=useState(params.id)
  const [data, setData] = useState<Game[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/games/${id}`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        setData(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="min-h-screen bg-grey-light">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        
        {/* Header Section */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Game Charts
          </h1>
          <p className="text-white/70 text-lg mb-6">
            Discover the best and most popular games
          </p>
          <Dropdown filter={params.id} setId={setId} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {[...Array(20)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-grey-dark aspect-[2/3] rounded-lg mb-2"></div>
                <div className="bg-grey-dark h-4 rounded w-3/4 mb-1"></div>
                <div className="bg-grey-dark h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Games Grid */}
        {!loading && data && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {data.map((game, index) => (
              <Link key={game.id} href={`/game/${game.id}`} className="group">
                <div className="relative">
                  
                  {/* Game Cover */}
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 shadow-lg">
                    {game.cover && (
                      <Image 
                        height={500} 
                        width={500} 
                        src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`} 
                        alt={`${game.name} cover`} 
                        className="w-full h-full object-cover border-2 border-white/20 group-hover:border-green-light transition-all duration-300"
                      />
                    )}
                    
                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2 bg-grey-dark/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20 flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-white font-semibold text-sm">{Math.floor(game.rating)}</span>
                    </div>

                    {/* Rank Badge */}
                    <div className="absolute top-2 left-2 bg-green-light text-grey-dark font-bold px-3 py-1 rounded-lg text-sm shadow-lg">
                      #{index + 1}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <div className="text-white text-xs">
                        <p className="font-semibold mb-1">Rating Count</p>
                        <p className="text-white/80">{game.rating_count.toLocaleString()} ratings</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Game Info */}
                  <div>
                    <p className="text-white font-semibold text-sm lg:text-base leading-tight line-clamp-2 mb-1">
                      {game.name}
                    </p>
                    
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && (!data || data.length === 0) && (
          <div className="text-center py-20">
            <p className="text-white/70 text-xl">No games found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameComponent;
