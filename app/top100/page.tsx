  'use client'
  'use strict';
  import React, { useEffect, useState } from 'react';
  
  type Game = {
    id: number;
    name: string;
    rating: number;
    rating_count: number;
    cover: { id: number; url: string };
    summary?: string;
  };
  
  const GameComponent: React.FC = () => {
    const [data, setData] = useState<Game[] | null>(null);
  
    useEffect(() => {
      fetch("api/games", {
        method: 'POST',
      })
        .then(response => response.json())
        .then(data => setData(data.data))
        .catch(err => {
          console.error(err);
        });
    }, []);
  
    return (
      <div className="p-4 bg-gray-100 h-screen">
        <h1 className="text-4xl font-bold mb-4">Top 100</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data?.map(game => (
            <div key={game.id} className="bg-white p-6 rounded shadow-md">
              <h2 className="text-2xl font-semibold mb-2">{game.name}</h2>
              <p className="mb-2"><strong className="font-medium">Rating:</strong> {game.rating.toFixed(2)}</p>
              <p className="mb-4"><strong className="font-medium">Ratings Count:</strong> {game.rating_count}</p>
              {game.summary && <p className="mb-4"><strong className="font-medium">Summary:</strong> {game.summary}</p>}
              <div className="mb-4">
              {game.cover && <img src={`https:${game.cover.url}`} alt={`${game.name} cover`} className="w-full h-64 object-cover rounded" />}
            </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  export default GameComponent;
  


