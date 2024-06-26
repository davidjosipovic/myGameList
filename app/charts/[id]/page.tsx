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

  useEffect(() => {
    fetch(`/api/games/${id}`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => setData(data.data))
      .catch(err => {
        console.error(err);
      });
  }, [id]);
  return (
    <div className="flex  justify-center lg:items-center z-0">
      <div className=" bg-grey-light mx-auto md:px-10 px-2   ">

        <h1 className=" lg: text-3xl font-bold mt-20 mb-4   lg:text-center  text-white">Charts</h1>
        <Dropdown filter={params.id} setId={setId} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-20 lg:gap-y-10 mb-20 xl:px-40">
          {data?.map((game, index) => (
            <Link key={game.id} href={`/game/${game.id}`}><div key={game.id} className=" relative  ">
              
                {game.cover && (
                  <Image height={500} width={500} src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`} alt={`${game.name} cover`} className=" border-2 border-hidden border-white hover:border-solid w-full  object-cover" />
                )}
                  <div className='absolute top-0 right-0 m-1  px-3 text-xl bg-grey-dark border w-fit text-white rounded-lg  border-white' >{Math.floor(game.rating)}</div>
                  <p className="text-md  text-white whitespace-nowrap overflow-hidden truncate">{index + 1 + ". " + game.name}</p>
              </div>
              
      
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameComponent;
