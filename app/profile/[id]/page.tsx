'use client'
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';


const dummyData = {
  picture: '/Default_pfp.png',
  name: 'DemoUser',
  info: 'This is a short bio for a demo user.',
  games:[]
};

const ProfilePage: React.FC = ({ params }: { params: { id: string } }) => {
  const [user, setUser] = useState(dummyData);
  const [isLoading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [completedGamesCount, setCompletedGamesCount] = useState<number>(0);
  
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(`/api/user/${encodeURIComponent(params.id)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const fetchedData = await response.json();
        setUser((prev) => ({ ...dummyData, ...fetchedData }));
        setLoading(false);
        console.log('Fetched Data:', fetchedData);
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
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
    return <div className="p-6 mt-24 max-w-2xl mx-auto bg-white rounded-xl shadow-md">Loading...</div>;
  }


  return (
    <div className=''>
    <div className="p-6 mt-24 max-w-2xl mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-y-4">
      <Image width={500}
        height={500} className="w-32 h-32 rounded-full" src={user.picture} alt='Profile picture'  />
     
      <h1 className="text-3xl font-semibold text-blue-500 ">{user.name}</h1>
      <p className="text-center text-gray-600">{user.info}</p>

      {/* Add an "Edit Profile" button, but require a session for editing */}
      {session ? (
        <Link href="/editprofile"className="text-blue-500 underline">Edit Profile
        
        </Link>
      ) : (
        <p className="text-gray-600">You need to be logged in to edit your profile.</p>
      )}
      <Link href={`/gamelist/${user.name}`}className="block w-32 mt-4 p-2 text-center bg-blue-500 hover:bg-blue-600 text-white rounded-md">Gamelist
        
      </Link>

      <section className="w-full mt-4 border-t border-gray-200 pt-4">
        <h2 className="text-xl font-semibold text-blue-500 mb-2">Statistics</h2>
        <ul className="list-disc pl-5">
          <li className="text-gray-700">Games Played: {completedGamesCount}</li>
          {/* Add other statistics fields as needed */}
        </ul>
      </section>
    </div>
    </div>
  );
};

export default ProfilePage;
