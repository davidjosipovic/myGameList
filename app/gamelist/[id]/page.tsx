"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import DeleteGameButton from "@/components/DeleteGameButton";
import Image from "next/image";

interface UserGame {
  id: number;
  gameId: string;
  rating: number | null;
  review: string | null;
  userId: string;
}

interface Game {
  id: number;
  name: string;
  rating: number | null;
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
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserGames = async () => {
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

  const fetchGameDetails = async (games: UserGame[]) => {
    try {
      const fetchPromises = games.map((game) =>
        fetch(`/api/game/${game.gameId}`, { method: "POST" }).then((res) =>
          res.json()
        )
      );

      const gamesData = await Promise.all(fetchPromises);

      const allGames = gamesData
        .map((responseData) =>
          responseData && responseData.data ? responseData.data[0] : null
        )
        .filter(Boolean);

      setCompletedGames(allGames);
    } catch (error) {
      console.error("Error fetching game details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set loading to false after 3 seconds even if no games are fetched
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Fetch user games
    fetchUserGames();

    // Clear the loading timeout if games are fetched before 3 seconds
    return () => clearTimeout(loadingTimeout);
  }, [params.id]);

  useEffect(() => {
    // Call fetchGameDetails with the updated userGames
    if (userGames.length > 0) {
      fetchGameDetails(userGames);
    }
  }, [userGames]); // Now using userGames as a dependency



  return (
    <div className=" mx-4 mt-20 ">

      <h1 className=" lg:text-3xl font-bold mb-8 text-2xl  lg:text-center  text-white">Game List</h1>
      <div className="text-lg border border-white rounded-lg
         px-2 w-52 lg:object-center mb-6 bg-grey-dark text-white lg:mx-auto">Completed
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-20 lg:gap-y-10 mb-20 xl:px-40">
        {completedGames?.map((game, index) => (
          <div key={game.id}>
            <div className="relative top-10 left-0 z-10 ">
              <DeleteGameButton
                gameId={game.id}
                userId={params.id}
                onGameDeleted={()=>{
                  fetchUserGames();
                }}

              />
            </div>
          <Link  href={`/game/${game.id}`}>
            <div  className=" relative  ">

            {game.cover && (
              <Image className=" border-2 border-hidden border-white hover:border-solid w-full  object-cover"  height={500} width={500} src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`} alt={`${game.name} cover`}  />
            )}
            <div  className='absolute top-0 right-0 m-1  px-3 text-xl bg-grey-dark border w-fit text-white rounded-lg  border-white' >{Math.floor(game.rating)}</div>
            
            <p className="text-md  text-white whitespace-nowrap overflow-hidden truncate">{index + 1 + ". " + game.name}</p>
          </div>


          </Link>
          
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameList;
