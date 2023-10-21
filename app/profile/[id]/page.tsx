'use client'
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link'; 

const dummyData = {
  pictureUrl: 'https://via.placeholder.com/150',
  name: 'DemoUser',
  info: 'This is a short bio for a demo user.',
  gamesPlayed: 150
};

const ProfilePage: React.FC = ({ params }: { params: { id: string } }) => {
  const [user, setUser] = useState(dummyData);
  const [isLoading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(`/api/user/${encodeURIComponent(params.id)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const fetchedData = await response.json();
        setUser(prev => ({ ...dummyData, ...fetchedData }));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
      }
    }
    fetchUserData();
  }, [params.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 mt-24 max-w-2xl mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-y-4">
      <img className="w-32 h-32 rounded-full" src={user.pictureUrl} alt={`${user.name} profile`} />
      <h1 className="text-3xl font-semibold">{user.name}</h1>
      <p className="text-center text-gray-600">{user.info}</p>
    
      {/* Add an "Edit Profile" button, but require a session for editing */}
      {session ? (
        <Link className="text-blue-500 underline" href="/editprofile">
          Edit Profile
        </Link>
      ) : (
        <p>You need to be logged in to edit your profile.</p>
      )}
      <div><Link href={`/gamelist/${user.name}`}><div className="cursor-pointer hover:bg-gray-200 p-2 rounded w-full text-center">Gamelist</div></Link></div>
      <section className="w-full mt-4 border-t border-gray-200 pt-4">
        <h2 className="text-xl font-bold mb-2">Statistics</h2>
        <ul className="list-disc pl-5">
          <li className="text-gray-700">Games Played: {user.gamesPlayed}</li>
          {/* Add other statistics fields as needed */}
        </ul>
      </section>
    </div>
  );
};

export default ProfilePage;
