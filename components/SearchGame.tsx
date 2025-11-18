'use client'
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        if (searchInput.trim()) {
          setIsLoading(true);
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
      } finally {
        setIsLoading(false);
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

  // Mobile/Small screen version
  if (props.screen === "small") {
    return (
      <div 
        className={`fixed top-0 left-0 w-full h-screen bg-black/50 backdrop-blur-sm z-30 transition-all duration-300 ${
          props.isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => props.setIsSearchOpen(false)}
      >
        <div 
          className={`bg-grey-dark border-b border-white/20 p-4 transition-transform duration-300 ${
            props.isSearchOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
          onClick={(e) => e.stopPropagation()}
          ref={inputRef}
        >
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-grey-light text-white border border-white/20 focus:border-green-light focus:outline-none transition-colors"
                type="text"
                placeholder="Search for a game..."
                value={searchInput}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchInput.trim()) {
                    props.setIsSearchOpen(false);
                    setSearchInput("");
                    router.push('/search/' + searchInput);
                  }
                }}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setIsDropdownOpen(!!e.target.value);
                }}
              />
            </div>
            <button 
              onClick={() => props.setIsSearchOpen(false)} 
              className="px-4 py-3 text-white hover:text-green-light transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Search Results Dropdown */}
          {isDropdownOpen && (
            <div className="mt-4 bg-grey-light rounded-lg border border-white/20 max-h-96 overflow-y-auto shadow-xl">
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-light mx-auto mb-2"></div>
                  <p className="text-white/50 text-sm">Searching...</p>
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <>
                  {searchResults.slice(0, 8).map((result) => (
                    <Link 
                      className='flex items-center gap-3 p-3 hover:bg-grey-dark transition-colors border-b border-white/10 last:border-0' 
                      href={`/game/${result.id}`} 
                      key={result.id}
                      onClick={() => {
                        handleLinkClick();
                        props.setIsSearchOpen(false);
                      }}
                    >
                      {result.cover ? (
                        <Image
                          height={60}
                          width={60}
                          src={`https:${result.cover.url}`}
                          alt={`${result.name} cover`}
                          className="w-14 h-14 object-cover rounded border border-white/10"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-grey-dark rounded border border-white/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <span className="text-white flex-1 line-clamp-2">{result.name}</span>
                    </Link>
                  ))}
                  {searchResults.length > 8 && (
                    <button
                      onClick={() => {
                        props.setIsSearchOpen(false);
                        setSearchInput("");
                        router.push('/search/' + searchInput);
                      }}
                      className="w-full p-3 text-green-light hover:bg-grey-dark transition-colors text-sm font-semibold"
                    >
                      View all {searchResults.length} results →
                    </button>
                  )}
                </>
              ) : searchInput.trim() && !isLoading ? (
                <div className="p-6 text-center">
                  <svg className="w-12 h-12 text-white/20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-white/50 text-sm">No results found</p>
                </div>
              ) : null}
            </div>
          )}

          {hasError && <p className="text-red-500 mt-2 text-sm">Error fetching results. Please try again.</p>}
        </div>
      </div>
    );
  }

  // Desktop/Large screen version
  return (
    <div className="relative" ref={inputRef}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </svg>
        </div>
        <input
          className="w-64 pl-10 pr-4 py-2 rounded-lg bg-grey-dark text-white text-sm border border-white/20 focus:border-green-light focus:outline-none focus:w-80 transition-all"
          type="text"
          placeholder="Search games..."
          value={searchInput}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchInput.trim()) {
              setIsDropdownOpen(false);
              setSearchInput("");
              router.push('/search/' + searchInput);
            }
          }}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setIsDropdownOpen(!!e.target.value);
          }}
        />
      </div>

      {/* Search Results Dropdown */}
      {isDropdownOpen && (
        <div className="absolute top-full mt-2 w-96 bg-grey-dark rounded-lg border border-white/20 shadow-2xl max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-light mx-auto mb-2"></div>
              <p className="text-white/50 text-sm">Searching...</p>
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <>
              {searchResults.slice(0, 8).map((result) => (
                <Link 
                  className='flex items-center gap-3 p-3 hover:bg-grey-light transition-colors border-b border-white/10 last:border-0' 
                  href={`/game/${result.id}`} 
                  key={result.id}
                  onClick={handleLinkClick}
                >
                  {result.cover ? (
                    <Image
                      height={60}
                      width={60}
                      src={`https:${result.cover.url}`}
                      alt={`${result.name} cover`}
                      className="w-14 h-14 object-cover rounded border border-white/10"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-grey-light rounded border border-white/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <span className="text-white text-sm flex-1 line-clamp-2">{result.name}</span>
                </Link>
              ))}
              {searchResults.length > 8 && (
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setSearchInput("");
                    router.push('/search/' + searchInput);
                  }}
                  className="w-full p-3 text-green-light hover:bg-grey-light transition-colors text-sm font-semibold border-t border-white/10"
                >
                  View all {searchResults.length} results →
                </button>
              )}
            </>
          ) : searchInput.trim() && !isLoading ? (
            <div className="p-6 text-center">
              <svg className="w-12 h-12 text-white/20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-white/50 text-sm">No results found</p>
            </div>
          ) : null}
        </div>
      )}

      {hasError && <p className="absolute top-full mt-1 text-red-500 text-xs">Error fetching results. Please try again.</p>}
    </div>
  );
};

export default SearchGame;
