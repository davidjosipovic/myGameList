'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

type Game = {
  id: number;
  name: string;
  rating: number;
  rating_count: number;
  summary: string;
  cover: { id: number; url: string };
  screenshots: { url: string }[];
  videos: { video_id: string }[];
  standalone_expansions: { name: string }[];
  platforms: { name: string }[];
  genres: { name: string }[];
  game_modes: { name: string }[];
  first_release_date: number;
};


const GameComponent: React.FC = ({ params }: { params: { id: string } }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [review, setReview] = useState<string>('');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const { data: session } = useSession()


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

  const handleAddToListClick = () => {
    if (game) {
      const requestData = {
        gameId: params.id,
        rating: selectedRating || 0,
        review: review,
      };

      fetch(`/api/gamelist/${session.user.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => {
          if (response.ok) {
            // Handle success (e.g., display a success message)
          } else {
            // Handle error (e.g., display an error message)
            console.error('Error adding to list:', response.status);
          }
        })
        .catch((error) => {
          console.error('Error adding to list:', error);
        });
    }
  };

  const handleSubmitReview = () => {
    if (game) {
      const requestData = {
        gameId: params.id,
        rating: selectedRating || 0,
        review: review,
      };

      fetch(`/api/gamelist/${session.user.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => {
          if (response.ok) {
            // Handle success (e.g., display a success message)
          } else {
            // Handle error (e.g., display an error message)
            console.error('Error submitting review:', response.status);
          }
        })
        .catch((error) => {
          console.error('Error submitting review:', error);
        });
    }

    setIsReviewOpen(false);
  };

  function formatUnixTimestamp(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-24">
      <div className="container  mx-auto py-8">
        {game ? (
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 md:flex md:space-x-4">
            <div className="md:w-1/3">
              {game.cover && (
                <Image
                  height={500}
                  width={500}
                  src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`}
                  alt={`${game.name} cover`}
                  className="w-3/4 md:w-2/3 mx-auto object-cover rounded mb-4"
                />
              )}
              <div className="mt-6 px-10">
                <div className="relative  inline-block">
                  <button
                    className="px-4 py-2 bg-gray-300 text-black rounded-md"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {selectedRating ? `Rate (${selectedRating})` : 'Rate'}
                  </button>
                  {renderRatingsDropdown()}
                </div>

                <button
                  className="px-4 py-2 ml-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  onClick={handleAddToListClick}
                >
                  Add to List
                </button>
                <button
                  className="px-4 py-2 ml-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  onClick={() => setIsReviewOpen(!isReviewOpen)}
                >
                  Review
                </button>
                {isReviewOpen && (
                  <div className="mt-4">
                    <textarea
                      className="w-full px-3 py-2 border rounded-md"
                      rows={4}
                      placeholder="Write your review..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                    ></textarea>
                    <button
                      className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                      onClick={handleSubmitReview}
                    >
                      Submit Review
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-3xl font-semibold text-indigo-800 mb-4">{game.name}</h2>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Rating:</span> {Math.floor(game.rating)}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Ratings Count:</span> {game.rating_count}
              </p>
              <p className="text-sm text-gray-700 mb-4">{game.summary}</p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Release Date:</span> {formatUnixTimestamp(game.first_release_date)}
              </p>

              {/* Include missing properties */}
              {game.platforms && game.platforms.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-indigo-800 mb-4">Platforms</h3>
                  <ul className="list-disc list-inside">
                    {game.platforms.map((platform, index) => (
                      <li key={index}>{platform.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {game.genres && game.genres.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-indigo-800 mb-4">Genres</h3>
                  <ul className="list-disc list-inside">
                    {game.genres.map((genre, index) => (
                      <li key={index}>{genre.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {game.game_modes && game.game_modes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-indigo-800 mb-4">Game Modes</h3>
                  <ul className="list-disc list-inside">
                    {game.game_modes.map((gameMode, index) => (
                      <li key={index}>{gameMode.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {game.standalone_expansions && game.standalone_expansions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-indigo-800 mb-4">Standalone Expansions</h3>
                  <ul className="list-disc list-inside">
                    {game.standalone_expansions.map((expansion, index) => (
                      <li key={index}>{expansion.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Display Screenshots */}
              {game.screenshots && game.screenshots.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-indigo-800 mb-4">Screenshots</h3>
                  <div className="flex flex-wrap">
                    {game.screenshots.map((screenshot, index) => (
                      <Image
                        height={500}
                        width={500}
                        key={index}
                        src={`https:${screenshot.url.replace('t_thumb', 't_cover_big')}`}
                        alt={`Screenshot ${index}`}
                        className="w-1/2 md:w-1/4 p-2"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Display Videos */}
              {game.videos && game.videos.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-indigo-800 mb-4">Videos</h3>
                  <div className="flex flex-wrap">
                    {game.videos.map((video, index) => (
                      <iframe
                        key={index}
                        src={`https://www.youtube.com/embed/${video.video_id}`}
                        title={`Video ${index}`}
                        className="w-1/2 md:w-1/4 p-2"
                      ></iframe>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500 mt-4">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default GameComponent;
