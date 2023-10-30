'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import DeleteGameButton from '@/components/DeleteGameButton';

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
  const { data: session } = useSession();
  const [gameExistsInDatabase, setGameExistsInDatabase] = useState(false); // Add state to track if the game exists
  const [isAddingToList, setIsAddingToList] = useState(false);

  const checkGameInDatabase = () => {
    fetch(`/api/gamelist/${session.user.name}/${params.id}`, { method: 'GET' })
      .then((response) => {
        response.json().then((data) => {
          if (data.status === 404) {
            setGameExistsInDatabase(false); // Set the state when the specific status message is received
          } else {

            setGameExistsInDatabase(true); // Set the state for other errors
          }
        });
      })
      .catch((error) => {
        console.error('Error checking game in the database:', error);
        setGameExistsInDatabase(false); // Handle the error by setting the state accordingly
      });
  };

  // Function to fetch game details
  const fetchGameDetails = () => {
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
  };

  useEffect(() => {
    if (params.id) {
      // Check if the game exists in the database
      checkGameInDatabase();

      // Fetch game details
      fetchGameDetails();
    }
  }, [params.id, session.user.name]);

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
    setIsDropdownOpen(false);

    // Add a fetch call to update the rating in the database
    const requestData = {
      gameId: params.id,
      rating: rating,
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
          console.error('Error updating rating:', response.status);
        }
      })
      .catch((error) => {
        console.error('Error updating rating:', error);
      });

    // Update the rating in the local state (game object)
    if (game) {
      const updatedGame = { ...game, rating: rating };
      setGame(updatedGame);
    }
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
      setIsAddingToList(true); // Set loading state
      const requestData = {
        gameId: params.id,
        rating: selectedRating || 0,
        review: review,
      };

      if (gameExistsInDatabase) {
        // Remove the game from the user's list
        fetch(`/api/gamelist/${session.user.name}`, {
          method: 'DELETE',
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
              console.error('Error removing from list:', response.status);
            }
          })
          .catch((error) => {
            console.error('Error removing from list:', error);
          });
      } else {
        // Add the game to the user's list
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
              checkGameInDatabase();
            } else {
              // Handle error (e.g., display an error message)
              console.error('Error adding to list:', response.status);
            }
          })
          .catch((error) => {
            console.error('Error adding to list:', error);
          })
          .finally(() => {
            setIsAddingToList(false); // Set loading state back to false
            setGameExistsInDatabase(true); // Set the state for other errors
          });
      }
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


                {gameExistsInDatabase ? (

                  <DeleteGameButton
                    gameId={game.id}
                    userId={session.user.name}
                    onGameDeleted={checkGameInDatabase}
                  />
                ) : (
                  <button
                    className={`px-4 py-2 ml-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600
  transition-opacity duration-300 ${isReviewOpen ? 'opacity-0 pointer-events-none' : ''}`}
                    onClick={handleAddToListClick}
                    disabled={isAddingToList}
                  >
                    {isAddingToList ? 'Adding to List...' : 'Add to List'}

                  </button>
                )}
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
