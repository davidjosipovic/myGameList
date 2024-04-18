'use client'
// Import necessary modules
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Define the Result type
type Result = {
  id: number;
  name: string;
  cover: { id: number; url: string };
};

// Define the SearchGame component
const SearchGame = ({ params }: { params: { id: string } }) => {
  // State variables
  const [searchResults, setSearchResults] = useState<Result[] | null>(null);
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Fetch search results on input change
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        if (params.id) {
          const response = await fetch(`/api/searchgame/${params.id}`, {
            method: 'POST',
          });

          if (response.ok) {
            const data = await response.json();
            setSearchResults(data.data);
            setHasError(false);
          } else {
            setHasError(true);
          }
        } else {
          setSearchResults([]);
          setHasError(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setHasError(true);
      }
    };

    const debounceTimeout = setTimeout(fetchSearchResults, 300);

    return () => clearTimeout(debounceTimeout);
  }, [params.id]);

  // JSX structure for the SearchGame component
  return (
      <div className="flex bg-black justify-center items-center z-0">
      <div className=" bg-grey-light mx-auto md:px-10 px-2   ">

        <h1 className=" lg: text-3xl font-bold mt-20 lg:text-center  text-white">Search Results for "{params.id}"</h1>
        <div className="text-lg mb-10 w-fit p-1 lg:object-center  mx-auto text-white text-opacity-50">{searchResults ? searchResults.length+" Results":"Loading..."} </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-20 lg:gap-y-10 mb-20 xl:px-40">
          {searchResults?.map((game, index) => (
            <Link key={index} href={`/game/${game.id}`}>
              <div className=" relative  ">
              
                {game.cover ? (
                  <Image priority height={500} width={500} src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`} alt={`${game.name} cover`} className="w-full  object-cover " />
                ):<div className='bg-grey-dark w-auto h-64 object-cover'></div>}
                  <p className="text-md  text-white whitespace-nowrap overflow-hidden truncate">{index + 1 + ". " + game.name}</p>
              </div>
              
      
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchGame;
