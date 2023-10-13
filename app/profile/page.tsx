'use client'
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';


type Game = {
  id: number;
  name: string;
};

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState({
    
    name: 'Username',
    bio: 'A short bio...',
    pictureUrl: 'https://via.placeholder.com/150',
    statistics: {
      gamesPlayed: 100,
      highestScore: 1200,
    },
    favoriteGames: [
      { id: 1, name: 'Game 1' },
      { id: 2, name: 'Game 2' },
      { id: 3, name: 'Game 3' },
    ],
  });
const { data: session } = useSession();
  return (
    <div className="p-6 mt-24 max-w-2xl mx-auto bg-white rounded-xl shadow-md flex flex-col space-y-4">
      <img className="w-32 h-32 rounded-full mx-auto" src={user.pictureUrl} alt={`${session.user.name} profile`} />
      <div>{session.user.email}</div>
      <h1 className="text-3xl font-semibold text-center">{user.name}</h1>
      <p className="text-center text-gray-600">{user.bio}</p>
      
      <section>
        <h2 className="text-xl font-bold">Statistics</h2>
        <ul>
          <li>Games Played: {user.statistics.gamesPlayed}</li>
          <li>Highest Score: {user.statistics.highestScore}</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold">Favorite Games</h2>
        <ul>
          {user.favoriteGames.map(game => (
            <li key={game.id}>{game.name}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ProfilePage;
