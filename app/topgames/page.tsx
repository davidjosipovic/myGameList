'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Game = {
  id: number;
  name: string;
  rating: number;
  rating_count: number;
  cover: { id: number; url: string };
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
    <div className="flex bg-black justify-center items-center">
      <div className="container bg-white mx-auto md:px-10 px-2   ">

        <h1 className="text-3xl font-bold mt-24 text-gray-700">mGL Charts</h1>
        <h2 className="text-4xl mb-10 text-gray-700">mGL Top 100 Video Games</h2>


        <div className="hidden md:px-5 md:flex md:mb-6 space-x-4">
          <div className="w-1/6 text-center py-2 font-bold text-gray-600 border-b-2 border-gray-400">Rank</div>
          <div className="w-5/6 py-2 font-bold pl-8 text-gray-600 border-b-2 border-gray-400">Title</div>
          <div className="w-1/6 text-center py-2 font-bold text-gray-600 border-b-2 border-gray-400">Rating</div>
          <div className="w-1/6 text-center py-2 font-bold text-gray-600 border-b-2 border-gray-400">Your score</div>
          <div className="w-1/6 text-center py-2 font-bold text-gray-600 border-b-2 border-gray-400">Status</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
          {data?.map((game, index) => (
            <Link key={game.id} href={`/game/${game.id}`}><div key={game.id} className="bg-white p-0 mx-0 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 relative md:flex md:space-x-4">

              <Link href={`/game/${game.id}`}><div className="md:hidden">
                {game.cover && (
                  <Image height={500} width={500} src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`} alt={`${game.name} cover`} className="w-full  object-cover rounded " />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 rounded-b">
                  <h2 className="text-sm  font-semibold underline text-white whitespace-nowrap overflow-hidden truncate">{index+1+". "+game.name}</h2>
                  <p className="text-white text-sm ">Rating: {Math.floor(game.rating)}</p>
                  <p className="text-white text-sm">Ratings Count: {game.rating_count}</p>
                </div>
              </div></Link>

              <div className="hidden md:block w-1/6 text-center py-6 text-4xl text-gray-600">
                {index + 1}
              </div>
              <div className=" hidden md:flex w-5/6 items-center">
                {game.cover && (
                  <Image height={500} width={500}  src={`https:${game.cover.url}`} alt={`${game.name} cover`} className="w-24 h-24 object-cover rounded mr-4 shadow" />
                )}
                <div className=''>
                  <h2 className="text-xl  font-semibold text-gray-700">{game.name}</h2>
                  <p className="text-gray-500">Ratings: {game.rating_count}</p>
                </div>
              </div>

              <div className="hidden md:block w-1/6 text-center py-6 text-2xl font-semibold text-gray-700">
              {Math.floor(game.rating)}
              </div>
              <div className="hidden md:block w-1/6 text-center py-7 text-lg text-gray-600">
                N/A
              </div>
              <div className="hidden md:block w-1/6 text-center py-7 text-lg text-indigo-500 font-semibold">
                In work
              </div>

            </div></Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameComponent;
