'use client'
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const SearchGameComponent = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Define a function to fetch data when searchInput changes
    const fetchSearchResults = async () => {
      try {
        // Only fetch data if there is text in the input field
        if (searchInput) {
          const response = await fetch(`/api/searchgame/${searchInput}`, {
            method: 'POST',
          });

          if (response.ok) {
            const data = await response.json();
            setSearchResults(data.data);
            setHasError(false); // Clear any previous errors
          } else {
            setHasError(true);
          }
        } else {
          setSearchResults([]); // Clear search results when the field is empty
          setHasError(false); // Clear any previous errors
        }
      } catch (error) {
        console.error('Error:', error);
        setHasError(true);
      }
    };

    // Call the fetchSearchResults function whenever searchInput changes (debounced for better performance)
    const debounceTimeout = setTimeout(fetchSearchResults, 100); // Adjust the debounce delay as needed

    return () => clearTimeout(debounceTimeout); // Cleanup the timeout on unmount or input change
  }, [searchInput]);

  // Function to close the dropdown
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Function to handle clicks outside the component
  const handleClickOutside = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    // Add an event listener to handle clicks outside the component
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to handle link clicks
  const handleLinkClick = () => {
    setIsDropdownOpen(false); // Close the dropdown
    setSearchInput(''); // Clear the input field
  };

  return (
    <div className="relative inline-block" ref={inputRef}>
      <input
        className="w-full px-4 py-2 text-black rounded-md shadow-md focus:outline-none focus:ring focus:border-blue-300"
        type="text"
        placeholder="Search for a game"
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value);
          setIsDropdownOpen(!!e.target.value); // Open the dropdown if there is text in the field
        }}
      />

      {isDropdownOpen && searchResults.length > 0 && (
        <ul className="absolute text-black left-0 mt-2 w-full bg-white border rounded-md shadow-md z-10">
          {searchResults.map((result) => (
            <Link href={`/game/${result.id}`} key={result.id}>
              <li
                onClick={handleLinkClick}
                className="px-4 py-2 border-b hover:bg-gray-100 cursor-pointer"
              >
                {result.name}
              </li>
            </Link>
          ))}
        </ul>
      )}

      {hasError && (
        <p className="text-red-500">Error fetching data</p>
      )}
    </div>
  );
};

export default SearchGameComponent;
