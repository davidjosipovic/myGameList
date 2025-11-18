'use client'
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProfilePicture from '@/components/ProfilePicture';
import Button from '@/components/Button';
import RecentGames from './RecentGames';


const userData = {
  picture: '/Default_pfp.png',
  name: 'DemoUser',
  info: 'This is a short bio for a demo user.',
  createdAt: '',
  games: []
};

const ProfilePage: React.FC = ({ params }: { params: { id: string } }) => {
  const [user, setUser] = useState(userData);
  const [isLoading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [completedGamesCount, setCompletedGamesCount] = useState<number>(0);
  const fakegames = ["", "", "", ""]
  const [games, setGames] = useState([]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(`/api/user/${params.id}`);
        if (!response.ok) {
          // Check if the response status is 404 (User not found)
          if (response.status === 404) {
            // If user is not found, set user to null to indicate user not found
            setUser(null);
            setLoading(false); // Set loading state to false
          } else {
            // If there's another error, throw it
            throw new Error('Failed to fetch user data');
          }
        } else {
          const fetchedData = await response.json();
          setUser((prev) => ({ ...userData, ...fetchedData }));
          setLoading(false); // Set loading state to false
          console.log('Fetched Data:', fetchedData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false); // Set loading state to false
      }
    }
    
    
    

    fetchUserData();
  }, [params.id]);

  useEffect(() => {
    // Count completed games when user.games changes
    const countCompletedGames = user.games.length;
    setCompletedGamesCount(countCompletedGames);
  }, [user.games]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-grey-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {/* Profile Header Skeleton */}
          <section className='flex flex-col sm:flex-row gap-6 mb-8'>
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-grey-dark animate-pulse border-4 border-white/10" />
            <div className='flex-1 space-y-3 mt-2'>
              <div className="bg-grey-dark h-10 w-48 rounded animate-pulse"></div>
              <div className="bg-grey-dark h-5 w-36 rounded animate-pulse"></div>
              <div className="bg-grey-dark h-6 w-full max-w-md rounded animate-pulse"></div>
            </div>
          </section>

          {/* Buttons Skeleton */}
          <section className='flex flex-col sm:flex-row gap-4 mb-8'>
            <div className='bg-grey-dark h-12 w-full sm:w-40 rounded-lg animate-pulse'></div>
            <div className='bg-grey-dark h-12 w-full sm:w-40 rounded-lg animate-pulse'></div>
          </section>

          {/* Recent Games Skeleton */}
          <section className="mb-8">
            <div className="bg-grey-dark h-9 w-56 rounded mb-4 animate-pulse"></div>
            <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3'>
              {fakegames.map((_, index) =>
                <div className='bg-grey-dark aspect-[3/4] rounded-lg animate-pulse' key={index}></div>
              )}
            </div>
          </section>

          {/* Statistics Skeleton */}
          <section className="flex flex-col gap-4">
            <div className="bg-grey-dark h-9 w-40 rounded animate-pulse"></div>
            <div className='bg-grey-dark w-full max-w-md h-32 rounded-lg p-6 animate-pulse mx-auto'></div>
          </section>
        </div>
      </div>
    );
  }
  else if (user.name === "DemoUser") {
    return (
      <div className='min-h-screen bg-grey-light flex items-center justify-center px-4'>
        <div className='bg-grey-dark border border-white/20 rounded-2xl p-12 text-center max-w-md'>
          <svg className="w-20 h-20 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h1 className='text-white text-2xl font-bold mb-2'>User Not Found</h1>
          <p className='text-white/70 mb-6'>This user does not exist or has been removed.</p>
          <Link href="/">
            <Button label="Return Home" color="green" />
          </Link>
        </div>
      </div>
    );
  }
  else 
  {
  return (
    <div className="min-h-screen bg-grey-light">
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-br from-grey-dark via-grey-dark to-green-dark/20 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          {/* Profile Header */}
          <div className='flex flex-col sm:flex-row gap-6 items-center sm:items-start'>
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-green-light/30 shadow-2xl shadow-green-light/20 flex-shrink-0">
              <ProfilePicture className="rounded-full" size="big" />
            </div>
            <div className='flex-1 text-center sm:text-left'>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
                {user.name}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                <div className="flex items-center gap-2 bg-grey-light/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  <svg className="w-4 h-4 text-green-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-white/90 font-medium">Member Since {user.createdAt.slice(0, 7)}</span>
                </div>
              </div>
              {user.info && (
                <div className="bg-grey-light/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 max-w-2xl">
                  <p className="text-white/90 text-base leading-relaxed">{user.info}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3 mt-8 justify-center sm:justify-start'>
            {session && (
              <Link href="/editprofile" className="w-full sm:w-auto">
                <Button label="Edit Profile" color="green" />
              </Link>
            )}
            <Link href={`/gamelist/${user.name}`} className="w-full sm:w-auto">
              <Button label="View Game List" color="default" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          <div className="bg-gradient-to-br from-green-light/20 to-green-dark/20 border border-green-light/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
            <p className="text-green-light text-3xl font-bold">
              {games ? Object.values(games).filter((game)=>game.status==="Completed").length : 0}
            </p>
            <p className="text-white/70 text-sm mt-1">Completed</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 border border-blue-400/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
            <p className="text-blue-400 text-3xl font-bold">
              {games ? Object.values(games).filter((game)=>game.status==="Playing").length : 0}
            </p>
            <p className="text-white/70 text-sm mt-1">Playing</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
            <p className="text-yellow-400 text-3xl font-bold">
              {games ? Object.values(games).filter((game)=>game.status==="Backlog").length : 0}
            </p>
            <p className="text-white/70 text-sm mt-1">Backlog</p>
          </div>
          <div className="bg-gradient-to-br from-red-400/20 to-red-600/20 border border-red-400/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
            <p className="text-red-400 text-3xl font-bold">
              {games ? Object.values(games).filter((game)=>game.status==="Dropped").length : 0}
            </p>
            <p className="text-white/70 text-sm mt-1">Dropped</p>
          </div>
        </div>

        <RecentGames id={params.id} setGames={setGames}/>
      </div>
    </div>
  );
}};
export default ProfilePage;
