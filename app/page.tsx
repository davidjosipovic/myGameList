"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import HomeCarousel from "@/components/HomeCarousel";
import GameStatsChart from "@/components/GameStatsChart";
import RecommendationsSection from "@/components/RecommendationsSection";

interface GameStats {
  name: string;
  rating: number;
  plays: number;
}

const MyGameListHome: React.FC = () => {
  // Check user session
  const { data: session } = useSession();
  const [isDesktop, setDesktop] = useState(true);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.innerWidth > 600) {
      setDesktop(true);
    } else {
      setDesktop(false);
    }

    const updateMedia = () => {
      if (window.innerWidth > 600) {
        setDesktop(true);
      } else {
        setDesktop(false);
      }
    };
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, []);

  // GA4 Funnel – korak 1: korisnik je na homepageu
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'page_view_home', {
        event_category: 'funnel',
        event_label: 'Homepage Visit',
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const MAX_ATTEMPTS = 8;
    const POLL_INTERVAL = 5000; // 5 seconds
    let attempt = 0;

    const fetchStats = async () => {
      attempt++;
      try {
        const response = await fetch('/api/stats/public');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Empty data');

        if (!cancelled) {
          setGameStats(data);
          setLoading(false);
        }
        return; // success — stop polling
      } catch {
        // Keep polling until MAX_ATTEMPTS reached
        if (attempt < MAX_ATTEMPTS && !cancelled) {
          timer = setTimeout(fetchStats, POLL_INTERVAL);
          return;
        }
        // Final fallback
        if (!cancelled) {
          setGameStats([
            { name: 'The Witcher 3', rating: 9.5, plays: 15234 },
            { name: 'Elden Ring', rating: 9.2, plays: 18456 },
            { name: "Baldur's Gate 3", rating: 9.7, plays: 12890 },
            { name: 'Red Dead Redemption 2', rating: 9.3, plays: 16543 },
            { name: 'God of War', rating: 9.4, plays: 13245 },
            { name: 'Cyberpunk 2077', rating: 8.5, plays: 11234 },
            { name: 'Hades', rating: 9.1, plays: 10234 },
            { name: 'Hollow Knight', rating: 9.0, plays: 9876 },
          ]);
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchStats();

    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        {isDesktop ? (
          <Image src="/hero-big.svg"
            width={1920}
            height={600}
            alt="Hero Image"
            className="w-full h-auto"
            priority
          />
        ) : (
          <Image className="w-full h-auto" src="/hero-small.svg"
            width={800}
            height={400}
            alt="Hero Image"
            priority
          />
        )}
      </div>

      {/* Info Cards Section */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 my-8 lg:my-12">
          
          {/* Left Card */}
          <div className="flex-1 border border-white bg-grey-dark text-white rounded-lg p-6 lg:p-8 text-center shadow-lg">
            <h2 className="text-xl lg:text-2xl font-bold mb-3 text-green-light">Discover Gaming</h2>
            <p className="text-base lg:text-lg leading-relaxed">Track, showcase, and connect with fellow gamers in our vibrant community.</p>
          </div>

          {/* Middle Card - Login/Register (Desktop Only) */}
          {!session && (
            <div className="hidden lg:flex flex-col gap-6 justify-center items-center flex-1 border border-white bg-grey-dark text-white rounded-lg p-6 lg:p-8 shadow-lg">
              <h3 className="text-xl font-bold text-green-light">Join Us</h3>
              <div className="flex flex-col gap-4 w-full max-w-xs">
                <Link href="/login" className="w-full">
                  <Button label="Login" color="green" />
                </Link>
                <Link href="/register" className="w-full">
                  <Button label="Register" color="green" />
                </Link>
              </div>
            </div>
          )}

          {/* Right Card */}
          <div className="flex-1 border border-white bg-grey-dark text-white rounded-lg p-6 lg:p-8 text-center shadow-lg">
            <h2 className="text-xl lg:text-2xl font-bold mb-3 text-green-light">Get Started</h2>
            {session ? (
              <p className="text-base lg:text-lg leading-relaxed">Start exploring games and build your collection below!</p>
            ) : (
              <p className="text-base lg:text-lg leading-relaxed">Create an account to begin your gaming journey.</p>
            )}
          </div>
        </div>
      </div>

      {/* Game Carousels Section */}
      <section className="container mx-auto px-4 pb-12">
        
        {/* Top Gaming List with D3.js */}
        <div className="mb-10 lg:mb-16">
          <div className="inline-flex items-center w-full mb-4 lg:mb-6">
            <h1 className="text-lg lg:text-3xl font-bold text-white px-4 py-2 bg-grey-dark rounded-l-lg border border-white whitespace-nowrap">
              Top Gaming List
            </h1>
            <hr className="w-full h-px bg-white border-0" />
          </div>
          
          {loading ? (
            <div className="bg-grey-dark border border-white rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-light mx-auto mb-4"></div>
              <p className="text-white">Loading top games...</p>
            </div>
          ) : (
            <div className="bg-grey-dark border border-white rounded-lg p-4 sm:p-6">
              <GameStatsChart data={gameStats} title="Top Gaming List - Interactive Chart" />
            </div>
          )}
        </div>
        
        {/* New Releases */}
        <div className="mb-10 lg:mb-16">
          <div className="inline-flex items-center w-full mb-4 lg:mb-6">
            <h1 className="text-lg lg:text-3xl font-bold text-white px-4 py-2 bg-grey-dark rounded-l-lg border border-white whitespace-nowrap">
              New Releases
            </h1>
            <hr className="w-full h-px bg-white border-0" />
          </div>
          <HomeCarousel filter="new"/>
        </div>

        {/* Top Games */}
        <div className="mb-10 lg:mb-16">
          <div className="inline-flex items-center w-full mb-4 lg:mb-6">
            <h1 className="text-lg lg:text-3xl font-bold text-white px-4 py-2 bg-grey-dark rounded-l-lg border border-white whitespace-nowrap">
              Top Games
            </h1>
            <hr className="w-full h-px bg-white border-0" />
          </div>
          <HomeCarousel filter="top"/>
        </div>

        {/* Recommendations — visible only to logged-in users */}
        {session && (
          <div className="mb-10 lg:mb-16">
            <div className="inline-flex items-center w-full mb-4 lg:mb-6">
              <h1 className="text-lg lg:text-3xl font-bold text-white px-4 py-2 bg-grey-dark rounded-l-lg border border-white whitespace-nowrap">
                Recommended For You
              </h1>
              <hr className="w-full h-px bg-white border-0" />
            </div>
            <RecommendationsSection />
          </div>
        )}
      </section>

      {/* Mobile Login/Register */}
      {!session && (
        <div className="lg:hidden container mx-auto px-4 pb-8">
          <div className="border border-white bg-grey-dark text-white rounded-lg p-6 text-center mb-6 shadow-lg">
            <h3 className="text-xl font-bold mb-2 text-green-light">Join Our Community</h3>
            <p className="text-base">Create an account to get started.</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="flex-1 max-w-xs">
              <Button label="Login" color="green" />
            </Link>
            <Link href="/register" className="flex-1 max-w-xs">
              <Button label="Register" color="green" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGameListHome;
