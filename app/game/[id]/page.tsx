"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ScreenshotGallery from "@/app/game/[id]/ScreenshotGallery";
import VideoGallery from "@/app/game/[id]/VideoGallery";
import { useRouter } from "next/navigation";
import Lists from "./Lists";
import Rating from "./Rating";
import Heading from "./Heading";
import Summary from "./Summary";
import Button from "@/components/Button";
import UpdateGame from "./UpdateGame";

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
  const [isUpdateGameOpen, setIsUpdateGameOpen] = useState(false); // State to control UpdateGame component visibility
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
        className={`absolute left-0 mt-2 w-20 bg-white border rounded-md shadow-md z-10 ${isDropdownOpen ? "" : "hidden"
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


  const handleNotLoggedInAction = () => {

    // You can customize this function based on your requirements.
    // For example, you can show a modal to prompt the user to log in or register.
    // Here, we'll use the router to navigate to the "/login" route.
    router.push("/login");
  };

  const handleUpdateGameClick = () => {
    setIsUpdateGameOpen(true); // Open the UpdateGame component
    console.log("kaka")
  };

  return (
    <div className="mt-20 ">

      {game && (
        <div className="flex flex-wrap p-1">
          <Heading game={game} />

          {game.videos && game.videos.length > 0 && (
            <div className="w-full md:w-2/5 ">
              <iframe
                src={`https://www.youtube.com/embed/${game.videos[0].video_id}`}
                title="Video 0"
                className="w-full aspect-video h-full p-0.5 "
              ></iframe>
            </div>
          )}
          
          {game.cover && (
            <Image
              height={200}
              width={200}
              src={`https:${game.cover.url.replace("t_thumb", "t_cover_big")}`}
              alt={`${game.name} cover`}
              className="  w-1/4  md:w-1/5 px-0.5 my-2   "
            />
          )}

          <Summary game={game} />

          <div className="flex w-full gap-8 items-center mx-1">
            <Rating game={game} />
            <Button onClick={handleUpdateGameClick} className="w-1/2 h-fit text-md  " color="green" label="Add to mGL" />
          </div>

          <ScreenshotGallery screenshots={game.screenshots} />
          <Lists game={game} />
          <VideoGallery game={game}></VideoGallery>

          {isUpdateGameOpen && <UpdateGame setIsUpdateGameOpen={setIsUpdateGameOpen} game={game} />}
        </div>
      )}
    </div>
  );
};

export default GameComponent;
