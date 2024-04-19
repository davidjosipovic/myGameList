import Image from "next/image";
import { useEffect, useState } from "react"

export default function RecentGames(props){

  interface UserGame {
    id: number;
    gameId: string;
    rating: number | null;
    review: string | null;
    userId: string;
  }
  
  interface ApiGame {
    id: number;
    name: string;
    rating: number | null;
    cover: {
      id: number;
      url: string;
    };
  }

  const [userGames, setUserGames] = useState<UserGame[]>([]);
  const [games, setGames] = useState<ApiGame[]>([]);

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

      setGames(allGames);
    } catch (error) {
      console.error("Error fetching game details:", error);
    } finally {
  
    }
  };

  useEffect(() => {
    const fetchUserGames = async () => {
      try {
        const response = await fetch(`/api/gamelist/${props.id}`);
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

    fetchUserGames();
  });

  useEffect(() => {
    // Call fetchGameDetails with the updated userGames
    if (userGames.length > 0) {
      fetchGameDetails(userGames);
    }
  }, [userGames]); // Now using userGames as a dependency


    return( 
    <section className="flex flex-col gap-2 my-8">
    <h1 className="text-3xl font-semibold text-white ">Your Recent Games</h1>

    <div className='xl:hidden grid gap-2 grid-cols-4 sm:w-3/4 lg:w-auto content-evenly justify-items-center justify-evenly items-center lg:mx-28'>
      {games.slice(Math.max(games.length-4,0)).toReversed().map((game) =>
        <Image priority  alt="Recent game" src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`} width={200} height={200}/>
      )}
    </div>

    <div className='hidden xl:grid  grid-cols-5 gap-1 content-evenly justify-items-center justify-evenly items-center mx-28'>
      {games.slice(Math.max(games.length-5,0)).toReversed().map((game) =>
        <Image priority  alt="Recent game" src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`} width={250} height={250}/>
      )}
    </div>

  </section>)
}

