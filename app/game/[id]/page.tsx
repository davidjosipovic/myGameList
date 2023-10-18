'use client'

import React, { useEffect, useState } from 'react';

type Game = {
  id: number;
  name: string;
  rating: number;
  rating_count: number;
  summary: string;
  cover: { id: number; url: string };
};

const GameComponent: React.FC = ({ params }: { params: { id: string } }) => {
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/game/${params.id}`, {
        method: 'POST',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setGame(data.data[0]);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [params.id]);

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-800 text-center">Game Details</h1>
        {game ? (
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 max-w-md mx-auto">
            {game.cover && (
              <img
                src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`}
                alt={`${game.name} cover`}
                className="w-full object-cover rounded mb-4"
              />
            )}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{game.name}</h2>
            <p className="text-gray-600 mb-1"><span className="font-medium">Rating:</span> {game.rating}</p>
            <p className="text-gray-600 mb-2"><span className="font-medium">Ratings Count:</span> {game.rating_count}</p>
            <p className="text-sm text-gray-500 mt-2">{game.summary}</p>
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500">Loading...</p>
        )}
      </div>
    </div>
  );
}

export default GameComponent;
