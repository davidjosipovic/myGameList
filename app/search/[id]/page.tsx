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
    <div className="min-h-screen bg-grey-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Search Results
          </h1>
          <p className="text-white/70 text-lg">
            Showing results for "<span className="text-green-light font-semibold">{params.id.replace(/%20/g,' ')}</span>"
          </p>
          <p className="text-white/50 text-sm mt-1">
            {searchResults ? `${searchResults.length} ${searchResults.length === 1 ? 'result' : 'results'} found` : 'Loading...'}
          </p>
        </div>

        {/* Search Results Grid */}
        {searchResults && searchResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {searchResults.map((game, index) => (
              <Link key={game.id} href={`/game/${game.id}`}>
                <div className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                  {/* Game Cover */}
                  {game.cover ? (
                    <Image 
                      priority 
                      height={500} 
                      width={500} 
                      src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`} 
                      alt={`${game.name} cover`} 
                      className="w-full h-auto aspect-[3/4] object-cover"
                    />
                  ) : (
                    <div className='bg-grey-dark w-full aspect-[3/4] flex items-center justify-center'>
                      <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Game Number Badge */}
                  <div className="absolute top-2 left-2 bg-grey-dark/95 backdrop-blur-sm border border-green-light px-2 py-1 rounded-lg shadow-lg">
                    <p className="text-green-light text-xs font-bold">#{index + 1}</p>
                  </div>
                  
                  {/* Bottom Info Bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 pt-6">
                    <p className="text-white font-bold text-sm line-clamp-2 leading-tight">
                      {game.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : searchResults && searchResults.length === 0 ? (
          <div className='bg-grey-dark border border-white/20 rounded-2xl p-12 text-center'>
            <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className='text-white/70 text-lg'>No results found</p>
            <p className='text-white/50 text-sm mt-2'>Try searching with different keywords</p>
          </div>
        ) : hasError ? (
          <div className='bg-grey-dark border border-red-500/20 rounded-2xl p-12 text-center'>
            <svg className="w-16 h-16 text-red-500/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className='text-white/70 text-lg'>Error loading results</p>
            <p className='text-white/50 text-sm mt-2'>Please try again later</p>
          </div>
        ) : (
          <div className='bg-grey-dark border border-white/20 rounded-2xl p-12 text-center'>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-light mx-auto mb-4"></div>
            <p className='text-white/70 text-lg'>Loading results...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchGame;
