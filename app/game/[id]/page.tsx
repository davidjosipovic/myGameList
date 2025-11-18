"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Rating from "./Rating";
import Heading from "./Heading";
import Summary from "./Summary";
import Button from "@/components/Button";

// Lazy load components that are below the fold
const ScreenshotGallery = dynamic(() => import("@/app/game/[id]/ScreenshotGallery"), {
  loading: () => (
    <div className="bg-grey-dark rounded-lg border border-white/10 p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-white/10 rounded w-1/4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-video bg-white/10 rounded"></div>
          <div className="aspect-video bg-white/10 rounded"></div>
        </div>
      </div>
    </div>
  ),
  ssr: false
});

const VideoGallery = dynamic(() => import("@/app/game/[id]/VideoGallery"), {
  loading: () => (
    <div className="bg-grey-dark rounded-lg border border-white/10 p-8">
      <div className="animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
        <div className="aspect-video bg-white/10 rounded"></div>
      </div>
    </div>
  ),
  ssr: false
});

const Lists = dynamic(() => import("./Lists"), {
  loading: () => (
    <div className="bg-grey-dark rounded-lg border border-white/10 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-white/10 rounded w-1/2"></div>
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-4 bg-white/10 rounded w-2/3"></div>
      </div>
    </div>
  ),
  ssr: false
});

const UpdateGame = dynamic(() => import("./UpdateGame"), {
  ssr: false
});

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
  const [gameExistsInDatabase, setGameExistsInDatabase] = useState(false);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [isUpdateGameOpen, setIsUpdateGameOpen] = useState(false);
  const router = useRouter();

  const checkGameInDatabase = async () => {
    if (!session) return;
    
    try {
      const response = await fetch(
        `/api/gamelist/${session.user ? session.user.name : ""}/${params.id}`,
        { method: "GET" }
      );
      const data = await response.json();
      
      if (data.status === 404) {
        setGameExistsInDatabase(false);
      } else {
        setGameExistsInDatabase(true);
        setMyRating(data.rating);
      }
    } catch (error) {
      console.error("Error checking game in the database:", error);
      setGameExistsInDatabase(false);
    }
  };

  const fetchGameDetails = async () => {
    try {
      const response = await fetch(`/api/game/${params.id}`, {
        method: "POST",
      });
      const data = await response.json();
      setGame(data.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      // Run both API calls in parallel for faster loading
      Promise.all([
        fetchGameDetails(),
        checkGameInDatabase()
      ]);
    }
  }, [params.id]);
  
  useEffect(() => {
    if (params.id) {
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
            // Handle success
          } else {
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
    router.push("/login");
  };

  const handleUpdateGameClick = () => {
    setIsUpdateGameOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-light border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-2">Error loading game data.</p>
          <p className="text-white/60">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-8 sm:pb-12">
      {/* Hero Section with Cover and Video */}
      <div className="relative w-full bg-gradient-to-b from-grey-dark to-black pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Mobile Layout - Stack everything vertically */}
          <div className="lg:hidden flex flex-col gap-4 sm:gap-6">
            {/* Game Heading First on Mobile */}
            <Heading game={game} />
            
            {/* Video */}
            {game.videos && game.videos.length > 0 && (
              <div className="relative rounded-lg overflow-hidden shadow-2xl border border-white/10">
                <iframe
                  src={`https://www.youtube.com/embed/${game.videos[0].video_id}`}
                  title="Game Trailer"
                  className="w-full aspect-video"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Cover and Rating Side by Side on Mobile */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Cover Image */}
              {game.cover && (
                <div className="flex-shrink-0">
                  <Image
                    priority
                    loading="eager"
                    src={`https:${game.cover.url.replace("t_thumb", "t_cover_big")}`}
                    alt={`${game.name} cover`}
                    width={264}
                    height={352}
                    className="w-full h-auto rounded-lg shadow-2xl border border-white/10"
                    sizes="(max-width: 768px) 50vw, 264px"
                  />
                </div>
              )}

              {/* Rating Card */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <Rating game={game} myRating={myRating} />
                
                {/* Add to List Button */}
                {session && (
                  <Button 
                    onClick={handleUpdateGameClick} 
                    className="w-full py-2 text-sm sm:text-base font-bold" 
                    color="green" 
                    label={gameExistsInDatabase ? "Update" : "Add to mGL"} 
                  />
                )}
              </div>
            </div>

            {/* Summary */}
            <Summary game={game} />
          </div>

          {/* Desktop Layout - Original 3 column grid */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8">
            {/* Left Column - Cover and Rating */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Cover Image */}
              {game.cover && (
                <div className="flex-shrink-0 group">
                  <Image
                    priority
                    loading="eager"
                    src={`https:${game.cover.url.replace("t_thumb", "t_cover_big")}`}
                    alt={`${game.name} cover`}
                    width={264}
                    height={352}
                    className="w-full h-auto rounded-lg shadow-2xl border border-white/10 group-hover:border-green-light/50 transition-all duration-300"
                    sizes="(max-width: 1024px) 50vw, 264px"
                  />
                </div>
              )}

              {/* Rating Card */}
              <Rating game={game} myRating={myRating} />

              {/* Add to List Button */}
              {session && (
                <Button 
                  onClick={handleUpdateGameClick} 
                  className="w-full py-3 text-lg font-bold" 
                  color="green" 
                  label={gameExistsInDatabase ? "Update" : "Add to mGL"} 
                />
              )}
            </div>

            {/* Middle/Right Column - Video and Heading */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Video */}
              {game.videos && game.videos.length > 0 && (
                <div className="relative rounded-lg overflow-hidden shadow-2xl border border-white/10 hover:border-green-light/50 transition-all duration-300">
                  <iframe
                    src={`https://www.youtube.com/embed/${game.videos[0].video_id}`}
                    title="Game Trailer"
                    className="w-full aspect-video"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Game Heading */}
              <Heading game={game} />

              {/* Summary */}
              <Summary game={game} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Column - Screenshots and Videos */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Screenshots Gallery */}
            {game.screenshots && game.screenshots.length > 0 && (
              <ScreenshotGallery screenshots={game.screenshots} />
            )}

            {/* Additional Videos */}
            {game.videos && game.videos.length > 1 && (
              <VideoGallery game={game} />
            )}
          </div>

          {/* Right Column - Lists (Platforms, Companies) */}
          <div className="lg:col-span-1">
            <Lists game={game} />
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {isUpdateGameOpen && (
        <>
          <div 
            onClick={() => setIsUpdateGameOpen(false)} 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />
          <UpdateGame 
            setIsUpdateGameOpen={setIsUpdateGameOpen} 
            game={game} 
            userId={session.user.name} 
          />
        </>
      )}
    </div>
  );
};

export default GameComponent;
