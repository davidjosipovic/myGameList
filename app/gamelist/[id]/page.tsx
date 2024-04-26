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
  const [userGames, setUserGames] = useState<UserGame[]>([]);
  const [completedGames, setCompletedGames] = useState<Game[]>([]);
  const [, setIsLoading] = useState(true);
  const [, setIsDeletingGame] = useState("All games");
  const [filter, setFilter] = useState("All games");

  const fetchAllGames = async () => {
    try {
      const response = await fetch(`/api/gamelist/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserGames(data);
      } else {
        console.error("Failed to fetch user games");
      }
    } catch (error) {
      console.error("Error fetching user games:", error);
    }
  };

  const fetchGameDetails = async () => {
    try {
      const fetchPromises = userGames.map((game) =>
        fetch(`/api/game/${game.gameId}`, { method: "POST" }).then((res) =>
          res.json()
        )
      );

      const gamesData = await Promise.all(fetchPromises);

      const allGames = gamesData
        .map((responseData, index) => ({
          ...responseData.data[0],
          status: userGames[index].status,
          userRating: userGames[index].rating,
          
        }))
        .filter(Boolean);

      setCompletedGames(allGames);
    } catch (error) {
      console.error("Error fetching game details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    fetchAllGames();

    return () => clearTimeout(loadingTimeout);
  }, [params.id]);

  useEffect(() => {
    if (userGames.length > 0) {
      fetchGameDetails();
    }
  }, [userGames]);

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
    <div className="mx-4 mt-20">
      <h1 className="lg:text-3xl font-bold mb-8 text-2xl lg:text-center text-white">
        Game List
      </h1>
      <Dropdown setFilter={setFilter} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-20 lg:gap-y-10 mb-20 xl:px-40">
        {filteredGames.map((game, index) => (
          <div key={game.id}>
            <div className="relative top-10 left-0 z-10 ">
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
            <Link href={`/game/${game.id}`}>
              <div className="relative">
                {game.cover && (
                  <Image
                  priority
                    className="border-2 border-hidden border-white hover:border-solid w-full object-cover"
                    height={500}
                    width={500}
                    src={`https:${game.cover.url.replace(
                      "t_thumb",
                      "t_cover_big"
                    )}`}
                    alt={`${game.name} cover`}
                  />
                )}
                <div className="absolute top-0 right-0 m-1 px-3 py-0.5 text-xl bg-grey-dark border w-fit text-white rounded-lg border-white">
                  {Math.floor(game.rating)}
                </div>
                <div className=" items-center">
                  <Image className="absolute top-4 right-4 m-1 px-3 " src="/rating-star.svg" width={75} height={75} alt="Rating Star"/>
                  <p className="absolute text-grey-dark top-7 right-11 text-xl font-bold   ">{game.userRating}<span className={game.userRating===10?"hidden":"invisible"}>.</span></p>
                  </div>
                
                <p className="text-md text-white  whitespace-nowrap overflow-hidden truncate">
                  {index + 1 + ". " + game.name}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameList;
