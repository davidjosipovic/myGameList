'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import DeleteGameButton from '@/components/DeleteGameButton';
import ScreenshotGallery from '@/components/ScreenshotGallery';

type Game = {
  id: number;
  name: string;
  rating: number;
  rating_count: number;
  your_rating: number;
  summary: string;
  cover: { id: number; url: string };
  screenshots: { url: string }[];
  videos: { video_id: string }[];
  standalone_expansions: { name: string }[];
  platforms: { name: string }[];
  genres: { name: string }[];
  game_modes: { name: string }[];
  first_release_date: number;
  involved_companies: { company: { name: string } }[];

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
    if (session) {
      fetch(`/api/gamelist/${session.user ? session.user.name : ''}/${params.id}`, { method: 'GET' })
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
    }
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
  }, [params.id]);

  const handleRatingChange = (your_rating: number) => {
    setSelectedRating(your_rating);
    setIsDropdownOpen(false);

    // Add a fetch call to update the rating in the database
    const requestData = {
      gameId: params.id,
      rating: your_rating,
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
      const updatedGame = { ...game, your_rating: your_rating };
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
  const handleNotLoggedInAction = () => {
    // You can customize this function based on your requirements.
    // For example, you can show a modal to prompt the user to log in or register.
    alert("Please log in or register to use this feature.");
  };

  return (
    <div className="bg-gray-100 p-4 md:p-24">
      <div className="container  mx-auto ">
        {game ? (
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 md:flex flex-col ">
            <div className='flex flex-row gap-5 text-center mb-3'>

              <h2 className="text-4xl font-semibold text-black mb-4">{game.name}</h2>

              <div className='flex flex-col ml-auto'>
                <p className="text-gray-600 font-medium"> IGDB Rating </p>
                <p className=' font-semibold text-xl'>{Math.floor(game.rating)}/100</p>
              </div>

              <div className='flex flex-col '>
                <p className="text-gray-600 font-medium float-right"> Ratings Count</p>
                <p className=' font-semibold text-xl'>{game.rating_count}</p>
              </div>

              <div className='flex flex-col '>
                <p className="text-gray-600 font-medium float-right"> Your Rating</p>
                <p className=' font-semibold text-xl'>N/A</p>
              </div>

            </div>

            <div className='flex flex-row gap-2'>
              {/* Chunk 1: Game Cover Image */}
              {game.cover && (
                <Image
                  height={200}
                  width={200}
                  src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`}
                  alt={`${game.name} cover`}
                  className=" object-cover w-1/6"
                />
              )}

              {game.videos && game.videos.length > 0 && (
                <div className=" w-full h-full max-w-2xl ">

                  <iframe
                    src={`https://www.youtube.com/embed/${game.videos[0].video_id}`}
                    title="Video 0"
                    className="w-full aspect-video h-full"
                  ></iframe>

                </div>
              )}

              {/*Chunk 9: Screenshots*/}
              <div className=''>
                <ScreenshotGallery screenshots={game.screenshots} />
              </div>
            </div>
            <div className='flex flex-row mt-2'>

              {/*Chunk 6: Genres*/}
              {game.genres && game.genres.length > 0 && (
                <div className="">

                  <ul className="flex gap-1 my-2">
                    {game.genres.map((genre, index) => (
                      <li className='text-sm font-medium border rounded-3xl border-black p-0.5' key={index}>{genre.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/*Chunk 7: Game Modes*/}
              {game.game_modes && game.game_modes.length > 0 && (
                <div className="pl-1">

                  <ul className="flex my-2 gap-1">
                    {game.game_modes.map((gameMode, index) => (
                      <li className=' font-medium text-sm border rounded-3xl border-black p-0.5' key={index}>{gameMode.name}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
            <div className='flex'>
            <div className="md:w-2/3 ">


              <p className=" text-gray-700 mb-4 font-semibold">{game.summary}</p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Release Date:</span> {formatUnixTimestamp(game.first_release_date)}
              </p>

              
              {/* Chunk 5: Platforms */}
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

              {/*Chunk 8: Companies*/}
              {game.involved_companies && game.involved_companies.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-indigo-800 mb-4">Involved companies</h3>
                  <ul className="list-disc list-inside">
                    {game.involved_companies.map((company, index) => (
                      <li key={index}>{company.company.name}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
            <div className="">
              {session ? (
                <>
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
                    className="px-4 py-2  bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                    onClick={() => setIsReviewOpen(!isReviewOpen)}
                  >
                    Review
                  </button>
                  {/**/}
                  {isReviewOpen && (
                    // Chunk 3: Review Input and Submission
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
                </>

              ) : (

                /*Chunk 4: User Not Logged In (Login / Register)*/
                <button
                  className="px-4 py-2 ml-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  onClick={handleNotLoggedInAction}
                >
                  Login / Register
                </button>
              )}
            </div>
            </div>
          </div>
        ) : (
          // Chunk 11: Loading Message
          <p className="text-center text-lg text-gray-500 mt-4">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default GameComponent;