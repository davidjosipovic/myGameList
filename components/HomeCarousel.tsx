import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Game = {
  id: number;
  cover: { id: number; url: string };
  name: string;
};

export default function HomeCarousel(props) {
  const [data, setData] = useState<Game[] | null>(null);
  
  useEffect(() => {
    fetch(`api/games/${props.filter}`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => setData(data.data))
      .catch(err => {
        console.error(err);
      });
  }, []);

  return (
    <div className="flex mb-8 lg:mb-12 overflow-x-auto lg:pb-2" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'auto', msOverflowStyle: 'auto' }}>
      <div className="flex">
        {data?.slice(0, 10).map((game, index) =>
          <Link key={game.id} href={`/game/${game.id}`}>
            <div className="w-24  h-36 md:w-40 lg:w-60 lg:h-80 md:h-60 mx-2 ">
              <Image key={index} height={500} width={500} src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`} alt={`${game.name} cover`} className=" border-2 border-hidden border-white hover:border-solid"/>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
