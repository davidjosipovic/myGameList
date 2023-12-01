'use client'
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import App from "@/components/3dGameboy";

const MyGameListHome: React.FC = () => {
  // Check user session
  const { data: session } = useSession();

  return (
    <>
      {/* Main Container */}
      <div className="bg-gradient-to-b from-black to-purple-900 flex flex-col justify-center items-center">

        {/* 3D Gameboy Component */}
        <App />
        

        {/* Content Container */}
        <div className="bg-white mt-12 p-4  sm:p-6 md:p-8  max-w-screen-lg z-0 ">
          
          {/* Hero Image */}
          <Image
            width={500}
            height={500}
            src="/hero.jpg"
            alt="Game 1"
            className="w-full h-48 sm:h-64 md:h-72 lg:h-80 object-cover rounded-md mb-2 "
          />

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-purple-900 mb-4">
            Welcome to MyGameList
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mb-6 transition-opacity hover:opacity-70">
            Discover a world of gaming. Track, showcase, and connect with fellow gamers.
          </p>

          {/* Features Section */}
          <div className="mb-6">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
              Key Features
            </h2>
            <ul className="list-disc list-inside text-gray-700">
              <li>Track your favorite games and progress.</li>
              <li>Discover new games based on your interests.</li>
              <li>Connect with gamers from around the world.</li>
            </ul>
          </div>

          {/* Popular Games Section */}
          <div className="mb-6">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
              Popular Games
            </h2>
            {/* Add your popular games content here */}
          </div>

          {/* Testimonials Section */}
          <div>
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
              What Our Users Say
            </h2>
            <div className="bg-gray-100 p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg shadow-md ">
              <blockquote className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 italic">
                {"\"MyGameList has made it easy for me to keep track of my game collection and connect with friends who share my gaming interests.\""}
              </blockquote>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-800 mt-2">
                - John Doe, Gamer
              </p>
            </div>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex justify-between mt-6">
            {!session && (
              <>
                <Link
                  className="bg-emerald-500 hover:bg-emerald-700 text-white px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5 rounded transition duration-300 ease-in-out transform hover:scale-105"
                  href="/login"
                >
                  Sign In
                </Link>
                <Link
                  className="bg-purple-600 hover:bg-purple-800 text-white px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5 rounded transition duration-300 ease-in-out transform hover:scale-105"
                  href="/register"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyGameListHome;
