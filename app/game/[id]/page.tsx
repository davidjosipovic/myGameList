"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import DeleteGameButton from "@/components/DeleteGameButton";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import VideoGallery from "@/components/VideoGallery";
import { useRouter } from "next/navigation";

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
  const [review, setReview] = useState<string>("");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const { data: session } = useSession();
  const [gameExistsInDatabase, setGameExistsInDatabase] = useState(false); // Add state to track if the game exists
  const [isAddingToList, setIsAddingToList] = useState(false);
  const router = useRouter(); 

  const checkGameInDatabase = () => {
    if (session) {
      fetch(
        `/api/gamelist/${session.user ? session.user.name : ""}/${params.id}`,
        { method: "GET" }
      )
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
          console.error("Error checking game in the database:", error);
          setGameExistsInDatabase(false); // Handle the error by setting the state accordingly
        });
    }
  };

  // Function to fetch game details
  const fetchGameDetails = () => {
    fetch(`/api/game/${params.id}`, {
      method: "POST",
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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (response.ok) {
          // Handle success (e.g., display a success message)
        } else {
          // Handle error (e.g., display an error message)
          console.error("Error updating rating:", response.status);
        }
      })
      .catch((error) => {
        console.error("Error updating rating:", error);
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
      <ul
        className={`absolute left-0 mt-2 w-20 bg-white border rounded-md shadow-md z-10 ${
          isDropdownOpen ? "" : "hidden"
        }`}
      >
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
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        })
          .then((response) => {
            if (response.ok) {
              // Handle success (e.g., display a success message)
            } else {
              // Handle error (e.g., display an error message)
              console.error("Error removing from list:", response.status);
            }
          })
          .catch((error) => {
            console.error("Error removing from list:", error);
          });
      } else {
        // Add the game to the user's list
        fetch(`/api/gamelist/${session.user.name}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        })
          .then((response) => {
            if (response.ok) {
              // Handle success (e.g., display a success message)
              checkGameInDatabase();
            } else {
              // Handle error (e.g., display an error message)
              console.error("Error adding to list:", response.status);
            }
          })
          .catch((error) => {
            console.error("Error adding to list:", error);
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => {
          if (response.ok) {
            // Handle success (e.g., display a success message)
          } else {
            // Handle error (e.g., display an error message)
            console.error("Error submitting review:", response.status);
          }
        })
        .catch((error) => {
          console.error("Error submitting review:", error);
        });
    }

    setIsReviewOpen(false);
  };

  function formatUnixTimestamp(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  }
  const handleNotLoggedInAction = () => {
    
  // You can customize this function based on your requirements.
  // For example, you can show a modal to prompt the user to log in or register.
  // Here, we'll use the router to navigate to the "/login" route.
  router.push("/login");
  };

  return (
    <div className="container mt-16 sm:mt-20 md:mt-24  bg-white mx-auto ">
      {game ? (
        <div className="flex flex-wrap p-1">
          <div className="order-1 mb-2">
            <h2 className="md:text-5xl sm:text-3xl text-2xl font-semibold text-black">
              {game.name}
            </h2>
            <p className="text-gray-600">
              <span className="font-medium">Release Date:</span>{" "}
              {formatUnixTimestamp(game.first_release_date)}
            </p>
          </div>
          <div className="flex  order-5 sm:order-2 mt-4 sm:mt-0  gap-10 sm:gap-4 mx-auto sm:ml-auto sm:mx-0 pb-4">
            <div className="flex flex-col ml-auto">
              <p className="text-gray-600 font-medium"> IGDB Rating </p>
              <p className=" font-semibold text-xl text-center">
                {Math.floor(game.rating)}/100
              </p>
            </div>

            <div className="flex flex-col ">
              <p className="text-gray-600 font-medium ">
                {" "}
                Ratings Count
              </p>
              <p className=" font-semibold text-xl text-center">
                {game.rating_count}
              </p>
            </div>

            <div className="flex flex-col ">
              <p className="text-gray-600 font-medium ">
                {" "}
                Your Rating
              </p>
              <p className=" font-semibold text-center text-xl">N/A</p>
            </div>
          </div>
          <div className="basis-full h-0 order-2"></div>

          {/* Chunk 1: Game Cover Image */}
          {game.cover && (
            <Image
              height={200}
              width={200}
              src={`https:${game.cover.url.replace("t_thumb", "t_cover_big")}`}
              alt={`${game.name} cover`}
              className=" static w-1/3  md:w-1/5 p-0.5 order-3 "
            />
          )}

          {game.videos && game.videos.length > 0 && (
            <div className="w-2/3 md:w-2/5 order-4">
              <iframe
                src={`https://www.youtube.com/embed/${game.videos[0].video_id}`}
                title="Video 0"
                className="w-full aspect-video h-full p-0.5 "
              ></iframe>
            </div>
          )}

          {/*Chunk 9: Screenshots*/}
          <div className=" text-center md:w-2/5 p-0.5 order-9 md:order-5">
            <ScreenshotGallery screenshots={game.screenshots} />
            <div className=" flex gap-0.5 mt-0.5">
              {session ? (
                <>
                  {gameExistsInDatabase ? (
                    <div className="w-1/3 py-3 bg-red-600">
                      <DeleteGameButton
                        gameId={game.id}
                        userId={session.user.name}
                        onGameDeleted={checkGameInDatabase}
                      />
                    </div>
                  ) : (
                    <div className="w-1/3 py-3 bg-emerald-400 hover:bg-opacity-50 active:bg-opacity-30">
                      <button
                        className={` px-4 py-2  text-black  ${
                          isReviewOpen ? "opacity-0 pointer-events-none" : ""
                        }`}
                        onClick={handleAddToListClick}
                        disabled={isAddingToList}
                      >
                        {isAddingToList ? "Adding to List..." : "Add to List"}
                      </button>
                    </div>
                  )}
                  <div className="relative w-1/3 py-3 bg-gray-200 inline-block hover:bg-opacity-20 active:bg-opacity-10">
                    <button
                      className="px-4 py-2 text-black"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      {selectedRating ? `Rate (${selectedRating})` : "Rate"}
                    </button>
                    {renderRatingsDropdown()}
                  </div>
                  <div className="w-1/3 py-3 bg-gray-200 hover:bg-opacity-20 active:bg-opacity-10">
                    <button
                      className="py-2"
                      onClick={() => setIsReviewOpen(!isReviewOpen)}
                    >
                      Review
                    </button>
                  </div>

                  {isReviewOpen && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-md">
                      {/* Popup Content */}
                      <div className="mb-4">
                        <textarea
                          className="w-full px-3 py-2 border rounded-md"
                          rows={4}
                          placeholder="Write your review..."
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                        ></textarea>
                      </div>

                      <div>
                        <button
                          className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 mr-2"
                          onClick={handleSubmitReview}
                        >
                          Submit Review
                        </button>
                        <button
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                          onClick={() => setIsReviewOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /*Chunk 4: User Not Logged In (Login / Register)*/
                <button
                  className="relative w-full py-5 bg-gray-200 inline-block hover:bg-opacity-20 active:bg-opacity-10"
                  onClick={handleNotLoggedInAction}
                >
                  Sign In to Proceed
                </button>
              )}
            </div>
          </div>
          <div className="basis-full h-0 order-10"></div>

          <div className="flex flex-row flex-wrap mt-1 order-7 md:order-6">
            {/*Chunk 6: Genres*/}
            {game.genres && game.genres.length > 0 && (
              <div className="">
                <ul className="flex gap-1 my-2">
                  {game.genres.map((genre, index) => (
                    <li
                      className="text-sm border rounded-3xl border-black text-black px-2 py-1 whitespace-nowrap"
                      key={index}
                    >
                      {genre.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/*Chunk 7: Game Modes*/}
            {game.game_modes && game.game_modes.length > 0 && (
              <div className="pl-1">
                <ul className="flex my-2 gap-1">
                  {game.game_modes.map((gameMode, index) => (
                    <li
                      className=" text-sm border border-black rounded-3xl text-black  px-2 py-1 whitespace-nowrap"
                      key={index}
                    >
                      {gameMode.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="basis-full h-0 order-8"></div>

          <p className=" text-black mb-4 order-6 sm:mt-5 md:mt-0">{game.summary}</p>

          {/* Chunk 5: Platforms */}
          {game.platforms && game.platforms.length > 0 && (
            <div className="mt-6 order-11">
              <h3 className="text-2xl font-semibold text-black mb-4">
                Platforms
                <hr className=" border-black" />
              </h3>
              <ul className="list-disc text-gray-800 list-inside">
                {game.platforms.map((platform, index) => (
                  <li key={index}>{platform.name}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="basis-full h-0 order-12"></div>
          {/*Chunk 8: Companies*/}
          {game.involved_companies && game.involved_companies.length > 0 && (
            <div className="mt-6 order-[13]">
              <h3 className="text-2xl font-semibold text-black mb-4">
                Involved companies
                <hr className=" border-black" />
              </h3>

              <ul className="list-disc text-gray-800 list-inside">
                {game.involved_companies.map((company, index) => (
                  <li key={index}>{company.company.name}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="basis-full h-0 order-[14]"></div>
          <div className="mb-10 order-[15]">
            <h3 className="text-2xl font-semibold text-black mt-5 mb-4">
              Videos
              <hr className=" border-black" />
            </h3>
            <VideoGallery game={game}></VideoGallery>
          </div>
          <div className="basis-full h-0 order-[16]"></div>
        </div>
      ) : (
        // Chunk 11: Loading Message
        <p className="text-center text-lg text-gray-500 mb-8">Loading...</p>
      )}
    </div>
  );
};

export default GameComponent;
