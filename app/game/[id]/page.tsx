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
  const [review, setReview] = useState<string>("");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const { data: session } = useSession();
  const [gameExistsInDatabase, setGameExistsInDatabase] = useState(false); // Add state to track if the game exists
  const [myRating, setMyRating] = useState<number | null>(null);
  

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
              setMyRating(data.rating)
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
  useEffect(() => {
    if (params.id) {
      // Check if the game exists in the database
      checkGameInDatabase();
    }
  }, [isUpdateGameOpen]);


  const handleSubmitReview = () => {
    if (game) {
      const requestData = {
        gameId: params.id,
        rating: myRating || 0,
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
  };

  return (
    <div className="my-20">

      {game && (
        <div className="flex flex-wrap p-1 lg:justify-center">
          <Heading  game={game} />

          {game.videos && game.videos.length > 0 && (
            <div className="w-full sm:pl-2 lg:px-2 sm:w-4/6 sm:order-2 lg:w-2/6 ">
              <iframe
                src={`https://www.youtube.com/embed/${game.videos[0].video_id}`}
                title="Video 0"
                className="w-full aspect-video h-full   "
                  
              ></iframe>
            </div>
          )}
          
          {game.cover && (
            <Image
            priority
              height={200}
              width={200}
              src={`https:${game.cover.url.replace("t_thumb", "t_cover_big")}`}
              alt={`${game.name} cover`}
              className="  w-1/4  sm:w-2/6 sm:order-1  my-2 sm:my-0 lg:w-1/6   "
            />
          )}

          <Summary game={game} />

          <div className="flex w-full sm:w-1/3   items-center sm:items-start mx-2 sm:mx-0 sm:order-3 lg:order-4 sm:flex-col">
            <Rating game={game} myRating={myRating} />
            <Button onClick={handleUpdateGameClick} className=" h-fit text-md ml-auto sm:ml-0 " color="green" label={gameExistsInDatabase?"Update":"Add to mGL"} />
          </div>

          <ScreenshotGallery screenshots={game.screenshots} />
          <Lists game={game} />
          <VideoGallery game={game}></VideoGallery>

          {isUpdateGameOpen && <UpdateGame setIsUpdateGameOpen={setIsUpdateGameOpen} game={game} userId={session.user.name} />}
        </div>
      )}
    </div>
  );
};

export default GameComponent;
