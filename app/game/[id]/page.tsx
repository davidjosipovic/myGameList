'use client'
import React, { useEffect, useState } from 'react';

type Game = {
  id: number;
  name: string;
  rating: number;
  rating_count: number;
  summary: string;
  cover: { id: number; url: string };
};

const GameComponent: React.FC = ({ params }: { params: { id: string } }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/game/${params.id}`, {
        method: 'POST',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setGame(data.data[0]);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [params.id]);

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
    setIsDropdownOpen(false);
  };

  const renderRatingsDropdown = () => {
    const ratings = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
      <ul className={`absolute left-0 mt-2 w-20 bg-white border rounded-md shadow-md z-10 ${isDropdownOpen ? '' : 'hidden'}`}>
        {ratings.map((rating) => (
          <li
            key={rating}
            onClick={() => handleRatingChange(rating)}
            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
          >
            {rating}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-gray-100 mt-4 p-4 md:p-24">
      <div className="container mx-auto py-8">
        {game ? (
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 md:flex md:space-x-4">
            <div className="md:w-1/3">
              {game.cover && (
                <img
                  src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`}
                  alt={`${game.name} cover`}
                  className="w-full object-cover rounded mb-4"
                />
              )}
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{game.name}</h2>
              <p className="text-gray-600 mb-1"><span className="font-medium">Rating:</span> {game.rating}</p>
              <p className="text-gray-600 mb-2"><span className="font-medium">Ratings Count:</span> {game.rating_count}</p>
              <p className="text-sm text-gray-500">{game.summary}</p>
              <div className="flex mt-4">
                <div className="relative inline-block">
                  <button
                    className="px-4 py-2 bg-gray-300 text-black rounded-md"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {selectedRating ? `Rate (${selectedRating})` : 'Rate'}
                  </button>
                  {renderRatingsDropdown()}
                </div>
                
                <button
                  className="px-4 py-2 ml-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Add to List
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500">Loading...</p>
        )}
      </div>
    </div>
  );
}

export default GameComponent;

