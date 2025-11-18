import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react"

export default function RecentGames(props) {

  interface UserGame {
    id: number;
    gameId: string;
    rating: number | null;
    review: string | null;
    status: string | null;
    userId: string;
    gameDetails: {
      id: number;
      name: string;
      rating: number | null;
      cover: {
        id: number;
        url: string;
      };
    };
  }

  const [recentGames, setRecentGames] = useState<UserGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentGames = async () => {
      try {
        setIsLoading(true);
        
        console.log('Fetching recent games for user:', props.id);
        
        // Fetch recent games with details in single request
        const recentResponse = await fetch(`/api/gamelist/${props.id}/recent`);
        console.log('Recent games response status:', recentResponse.status);
        
        if (recentResponse.ok) {
          const recentData = await recentResponse.json();
          console.log('Recent games data:', recentData);
          setRecentGames(Array.isArray(recentData) ? recentData : []);
        } else {
          console.log('Recent games fetch failed');
          setRecentGames([]);
        }

        // Fetch all user games for stats
        const allGamesResponse = await fetch(`/api/gamelist/${props.id}`);
        console.log('All games response status:', allGamesResponse.status);
        
        if (allGamesResponse.ok) {
          const allGamesData = await allGamesResponse.json();
          console.log('All games data:', allGamesData);
          props.setGames(Array.isArray(allGamesData) ? allGamesData : []);
        } else {
          console.log('All games fetch failed');
          props.setGames([]);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
        setRecentGames([]);
        props.setGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (props.id) {
      fetchRecentGames();
    }
  }, [props.id]);


  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Recent Games</h2>
      
      {isLoading ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4'>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-grey-dark aspect-[3/4] rounded-lg animate-pulse border border-white/10"></div>
          ))}
        </div>
      ) : recentGames.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4'>
          {recentGames.map((game) => (
            <Link 
              key={game.id} 
              href={`/game/${game.gameDetails.id}`}
              className="group relative overflow-hidden rounded-lg border-2 border-transparent hover:border-green-light transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-light/30"
            >
              <Image 
                className="w-full h-auto aspect-[3/4] object-cover" 
                loading="lazy"
                alt={game.gameDetails.name || "Game cover"} 
                src={`https:${game.gameDetails.cover.url.replace('t_thumb', 't_cover_big')}`} 
                width={250} 
                height={333} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-sm line-clamp-2">{game.gameDetails.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className='bg-grey-dark border border-white/20 rounded-2xl p-12 text-center'>
          <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className='text-white/70 text-lg'>No games added yet</p>
          <p className='text-white/50 text-sm mt-2'>Start building your game list!</p>
        </div>
      )}
    </section>
  )
}
