'use client'
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import slidesearch from "./SlidingSearch.module.css"

type Result = {
  id: number;
  name: string;
  cover: { id: number; url: string };
};

const SearchGame = (props) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<Result[] | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        if (searchInput) {
          const response = await fetch(`/api/searchgame/${searchInput}`, {
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
  }, [searchInput]);



  const handleClickOutside = (event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLinkClick = () => {
    setIsDropdownOpen(false);
    setSearchInput('');
  };

  return (
    <div className={`fixed   ${props.isSearchOpen ? slidesearch.open : slidesearch.close} w-full  px-4 py-2 left-0 flex lg:w-1/3 bg-grey-light  lg:left-1/3     z-20`} ref={inputRef}>
      <div className="absolute  top-4 left-4 flex items-center pl-3 pointer-events-none">
        <svg className="w-4 h-4 text-grey-dark dark:text-grey-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
          <path stroke="#1A1A1A" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
        </svg>
      </div>

      <input
        className="w-full text-grey-dark  text-center  lg:py-1 py-1 rounded-3xl focus:outline-none "
        type="text"
        name='Search Input'
        placeholder="Search for a game"
        value={searchInput}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setIsDropdownOpen(false);
            setSearchInput("")
            router.push('/search/' + searchInput);
            
            
          }
        }}
        onChange={(e) => {
          setSearchInput(e.target.value);
          setIsDropdownOpen(!!e.target.value);
        }}
      />



      <button onClick={() => {
        props.setIsSearchOpen(false)
      }} className='  w-10 text-xl lg:hidden  text-center'>X</button>

      {isDropdownOpen && searchResults && searchResults.length > 0 && (
        <ul className="absolute text-white top-20  left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0  lg:w-full bg-grey-dark border border-white  rounded-lg ">
          {searchResults.map((result) => (
            <Link className='flex hover:bg-grey-light '  href={`/game/${result.id}`} key={result.id}>
              {result.cover && (
                <Image
                  height={200}
                  width={200}
                  src={`https:${result.cover.url}`}
                  alt={`${result.name} cover`}
                  className="w-20 h-20 object-cover rounded mr-0 shadow"
                />
              )}
              <li
                onClick={handleLinkClick}
                className="px-4 py-2  hover:bg-gray-100 cursor-pointer"
              >
                <div>{result.name.length > 25 ? `${result.name.substring(0, 32)}...` : result.name}</div>
              </li>
            </Link>
          ))}
        </ul>
      )}

      {hasError && <p className="text-red-500">Error fetching data</p>}
    </div>
  );
};

export default SearchGame;
