"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import HomeCarousel from "@/components/HomeCarousel";

const MyGameListHome: React.FC = () => {
  // Check user session
  const { data: session } = useSession();
  const [isDesktop, setDesktop] = useState(true);

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
