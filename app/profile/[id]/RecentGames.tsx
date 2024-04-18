import { useEffect, useState } from "react"

export default function RecentGames(props){

    interface Game {
        id: number;
        name: string;
        rating: number | null;
        cover: {
          id: number;
          url: string;
        };
      }

    const [games,setGames]=useState<Game[]>([])


   const fetchRecentGames=async()=>{
   try {
    const response = await fetch(`/api/gamelist/${props.id}`);
    if (response.ok){
        const data= await response.json();
        setGames(data)
        console.log(games)
    }
    else{
        console.error("Failed to fetch user games");
    }
   } catch (error) {
    console.error(error)
   }
}
   useEffect(()=>{
    if (games.length>0){
      fetchRecentGames()  
    }
    
   })

    return( 
    <section className="flex flex-col gap-2 my-8">
    <h1 className="text-3xl font-semibold text-white ">Your Recent Games</h1>

    <div className='flex gap-4'>
      {games.map((game) =>
        <div key={game.id} className='bg-white w-full h-28'>{game.name}</div>
      )}
    </div>

  </section>)
}