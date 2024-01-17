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
    <div className="container mx-auto my-8 p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold mb-4 text-gray-800">Game Search</h1>
      
      {/* Display search results */}
      {searchResults && searchResults.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
          {searchResults.map((result) => (
            <li key={result.id} className="mb-4">
              <Link className="block bg-white hover:shadow-lg rounded-lg overflow-hidden" href={`/game/${result.id}`}>
            
                  {result.cover && (
                    <Image
                      height={200}
                      width={200}
                      src={`https:${result.cover.url}`}
                      alt={`${result.name} cover`}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {result.name.length > 25 ? `${result.name.substring(0, 32)}...` : result.name}
                    </h3>
                  </div>
                
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Display error message */}
      {hasError && <p className="text-red-500 mt-4">Error fetching data</p>}
    </div>
  );
};

export default SearchGame;
