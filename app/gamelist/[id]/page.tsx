'use client'

import React, { useEffect, useState } from 'react';

type Game = {
  id: number;
  name: string;
  cover: { id: number; url: string };
};

const GameList: React.FC = ({ params }: { params: { id: string } }) => {
  const [completedGames, setCompletedGames] = useState<Game[] | null>(null);

  useEffect(() => {
    fetch(`/api/gamelist/${params.id}`)
      .then(response => response.json())
      .then(data => {setCompletedGames(data),console.log(data[0])})
      .catch(err => {
        console.error(err);
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-5xl font-extrabold mb-8 text-gray-700">My Completed Games</h1>

      <div className="w-full max-w-4xl">
        {completedGames?.map((game) => (
          <div key={game.id} className="bg-white m-2 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 flex items-center">
            {game.cover && (
              <img 
                src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`} 
                alt={`${game.name} cover`} 
                className="w-24 h-24 object-cover rounded mr-4" 
              />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-700">{game.id}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameList;
