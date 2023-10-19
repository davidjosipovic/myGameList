'use client';
import React, { useEffect, useState } from 'react';

type UserGame = {
  id: number;
  gameId: string;
  rating: null | number;
  review: null | string;
  userId: string;
};

type Game = {
  id: number;
  name: string;
  cover: { id: number; url: string };
};

interface GameListProps {
  params: { id: string };
}

const GameList: React.FC<GameListProps> = ({ params }) => {
  const [userGames, setUserGames] = useState<UserGame[]>([]);
  const [completedGames, setCompletedGames] = useState<Game[]>([]);

  const fetchUserGames = () => {
    fetch(`/api/gamelist/${params.id}`)
      .then(response => response.json())
      .then(setUserGames)
      .catch(console.error);
  };

  const fetchGameDetails = () => {
    const fetchPromises = userGames.map(game => 
      fetch(`/api/game/${game.gameId}`, { method: 'POST' }).then(res => res.json())
    );

    Promise.all(fetchPromises)
      .then(gamesData => {
        const allGames = gamesData.map(responseData => 
          (responseData && responseData.data) ? responseData.data[0] : null
        ).filter(Boolean);

        setCompletedGames(allGames);
      })
      .catch(console.error);
  };

  useEffect(fetchUserGames, [params.id]);
  useEffect(fetchGameDetails, [userGames]);

  const renderGame = (game: Game) => (
    <div key={game.id} className="bg-white m-2 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 flex items-center">
      {game.cover && (
        <img 
          src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`} 
          alt={`${game.name} cover`} 
          className="w-24 h-24 object-cover rounded mr-4" 
        />
      )}
      <div>
        <h2 className="text-xl font-semibold text-gray-700">{game.name}</h2>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-5xl font-extrabold mb-8 text-gray-700">My Completed Games</h1>
      <div className="w-full max-w-4xl">
        {completedGames.map(renderGame)}
      </div>
    </div>
  );
};

export default GameList;
