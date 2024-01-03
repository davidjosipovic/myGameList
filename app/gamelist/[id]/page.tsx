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

  const handleGameDeleted = () => {
    // Refetch user games after deletion
    fetchUserGames();
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
  
  const renderGame = (game: Game, userGame: UserGame, index: number) => (
    userGame && (
      <div
        key={game.id}
        className="bg-white m-2 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 flex items-center"
      >
        <span className="text-gray-500 mr-2 text-xl">{index + 1}.</span>
        {game.cover && (
          <Image
            width={500}
            height={500}
            src={`https:${game.cover.url.replace("t_thumb", "t_cover_big")}`}
            alt={`${game.name} cover`}
            className="w-24 h-24 object-cover rounded mr-4"
          />
        )}
        <div className="w-full">
          <Link href={`/game/${game.id}`}>
            <h2 className="text-xl font-semibold text-gray-700 inline">
              {game.name}
            </h2>
          </Link>

          {userGame.userId && (
            <div className=" bg-red-500  rounded-3xl float-right hover:bg-red-600 active:bg-red-700 ">
              <DeleteGameButton
                gameId={game.id}
                userId={params.id}
                onGameDeleted={handleGameDeleted}
              />
            </div>
          )}
          <p className="text-gray-500">
            {userGame.rating ? `Rating: ${userGame.rating}` : "No rating"}
          </p>
        </div>
      </div>
    )
  );

  return (
    <div className="flex flex-col items-center mt-10 min-h-screen bg-gradient-to-b from-black to-purple-900">
      <h1 className="text-5xl text-center font-extrabold mb-8 mt-10 text-white">
        My Completed Games
      </h1>
      <div className="w-full max-w-4xl">
        {isLoading ? (
          <div className="text-white text-center">Loading...</div>
        ) : completedGames.length === 0 && !isLoading ? (
          <div className="text-white text-center">No games in the list</div>
        ) : (
          completedGames.map((game, index) =>
            renderGame(game, userGames[index], index)
          )
        )}
      </div>
    </div>
  );
};

export default GameList;
