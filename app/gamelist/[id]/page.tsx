'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import DeleteGameButton from "@/components/DeleteGameButton";
import Image from "next/image";
import Dropdown from "../Dropdown";

interface UserGame {
  id: number;
  gameId: string;
  rating: number | null;
  review: string | null;
  status: string | null;
  userId: string;
}

interface Game {
  id: number;
  name: string;
  rating: number | null;
  status: string | null;
  userRating:number | null;
  cover: {
    id: number;
    url: string;
  };
}

interface GameListProps {
  params: {
    id: string;
  };
}

const GameList: React.FC<GameListProps> = ({ params }) => {
  const [completedGames, setCompletedGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsDeletingGame] = useState("All games");
  const [filter, setFilter] = useState("All games");

  const fetchAllGames = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching all games for user:', params.id);
      
      const response = await fetch(`/api/gamelist/${params.id}/all`);
      console.log('All games response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('All games data received:', data);
        setCompletedGames(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch user games:", errorData);
        setCompletedGames([]);
      }
    } catch (error) {
      console.error("Error fetching user games:", error);
      setCompletedGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllGames();
  }, [params.id]);

  const filteredGames = completedGames.filter(
    (game) => {
      if(filter==="All games"){
        return game
      }
      else{
        return game.status === filter
      }
      
    }
  );

  return (
    <div className="min-h-screen bg-grey-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Game List</h1>
          <p className="text-white/70">Browse and manage your game collection</p>
        </div>

        {/* Filter Dropdown */}
        <div className="mb-8">
          <Dropdown setFilter={setFilter} />
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="bg-grey-dark aspect-[3/4] rounded-lg animate-pulse border border-white/10"></div>
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredGames.map((game, index) => (
              <div key={game.id} className="group relative">
                <Link href={`/game/${game.id}`}>
                  <div className="relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                    {/* Game Cover */}
                    {game.cover && (
                      <Image
                        priority
                        className="w-full h-auto aspect-[3/4] object-cover"
                        height={500}
                        width={500}
                        src={`https:${game.cover.url.replace(
                          "t_thumb",
                          "t_cover_big"
                        )}`}
                        alt={`${game.name} cover`}
                      />
                    )}
                    
                    {/* Game Number Badge - Always visible */}
                    <div className="absolute top-2 left-2 bg-grey-dark/95 backdrop-blur-sm border border-green-light px-2 py-1 rounded-lg shadow-lg">
                      <p className="text-green-light text-xs font-bold">#{index + 1}</p>
                    </div>

                    {/* Delete Button - Shows on hover */}
                    <div 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-grey-dark/95 backdrop-blur-sm rounded-full p-0.5 shadow-lg border border-white/20"
                      onClick={(e) => e.preventDefault()}
                    >
                      <DeleteGameButton
                        setIsDeletingGame={setIsDeletingGame}
                        isAddingToList
                        gameId={game.id}
                        userId={params.id}
                        onGameDeleted={() => {
                          fetchAllGames();
                        }}
                        text={false}
                      />
                    </div>
                    
                    {/* Bottom Info - Always visible */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 pt-6">
                      <p className="text-white font-bold text-sm mb-1 line-clamp-2 leading-tight">
                        {game.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-white/70 text-xs">mGL</span>
                          <span className="text-white text-xs font-bold">{Math.floor(game.rating)}</span>
                        </div>
                        {game.userRating !== null && game.userRating !== 0 && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-white text-xs font-bold">{game.userRating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className='bg-grey-dark border border-white/20 rounded-2xl p-12 text-center'>
            <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className='text-white/70 text-lg'>No games found</p>
            <p className='text-white/50 text-sm mt-2'>Try changing your filter or add some games!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameList;
