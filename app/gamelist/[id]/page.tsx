'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DeleteGameButton from '@/components/DeleteGameButton';

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
      .then((response) => response.json())
      .then(setUserGames)
      .catch(console.error);
  };

  const fetchGameDetails = (games: UserGame[]) => {
    const fetchPromises = games.map((game) =>
      fetch(`/api/game/${game.gameId}`, { method: 'POST' }).then((res) => res.json())
    );

    Promise.all(fetchPromises)
      .then((gamesData) => {
        const allGames = gamesData
          .map((responseData) => (responseData && responseData.data ? responseData.data[0] : null))
          .filter(Boolean);

        setCompletedGames(allGames);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchUserGames();
  }, [params.id]);

  useEffect(() => {
    if (userGames.length > 0) {
      fetchGameDetails(userGames);
    }
  }, [userGames]);

  const renderGame = (game: Game, userGame: UserGame) => (
    
      <div className="bg-white m-2 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 flex items-center">
        {game.cover && (
          <img
            src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`}
            alt={`${game.name} cover`}
            className="w-24 h-24 object-cover rounded mr-4"
          />
        )}
        <div>
        <Link key={game.id} href={`/game/${game.id}`}><h2 className="text-xl font-semibold text-gray-700">{game.name}</h2></Link>
          <p className="text-gray-500">{userGame.rating ? `Rating: ${userGame.rating}` : 'No rating'}</p>
          {userGame.userId && ( // Check if the userGame has an ID to determine if it's in the user's list
          <DeleteGameButton gameId={game.id} userId={params.id} onGameDeleted={fetchUserGames} />
        )}
        </div>
      </div>
    
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-5xl font-extrabold mb-8 text-gray-700">My Completed Games</h1>
      <div className="w-full max-w-4xl">
        {userGames.length === 0 ? (
          <p className="text-gray-500">Please wait...</p>
        ) : completedGames.length === 0 ? (
          <p className="text-gray-500">No games in the list</p>
        ) : (
          completedGames.map((game, index) => renderGame(game, userGames[index]))
        )}
      </div>
    </div>
  );
};

export default GameList;
