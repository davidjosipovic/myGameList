'use client'
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProfilePicture from '@/components/ProfilePicture';
import Button from '@/components/Button';


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
  const games = ["", "", "", ""]

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(`/api/user/${encodeURIComponent(params.id)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const fetchedData = await response.json();
        setUser((prev) => ({ ...userData, ...fetchedData }));
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
    return (
      <div>

        <div className="mt-24 mx-4">

          <section className='flex gap-6 my-8'>
          <div  className="block relative  ">
            <div className={` object-cover rounded-full w-32 h-32 bg-grey-dark  `}   />
        </div>
            <div className='mt-2'>
              <div className="  bg-grey-dark w-20 h-8"></div>
              <div className="  bg-grey-dark  mb-2 mt-1 w-28 h-6 "></div>
              <div className="bg-grey-dark   w-40 h-6 "></div>
            </div>
          </section>


          <section className='flex flex-col gap-4 my-10 '>
            <div className='bg-grey-dark w-32 h-10'></div>
            <div className='bg-grey-dark w-32 h-10'></div>
          </section>

          <section className="flex flex-col gap-2 my-8">
          <div className="  bg-grey-dark w-40 h-8"></div>

            <div className='flex gap-4'>
              {games.map((map) =>
                <div className='bg-grey-dark w-full h-28'></div>
              )}
            </div>


          </section>

          <section className="flex flex-col gap-2 my-8">
          <div className="  bg-grey-dark w-40 h-8"></div>
            <ul className='bg-grey-dark  w-full h-40  p-2'>
             
            </ul>

          </section>

        </div>

      </div>);
  }


  return (
    <div className="mt-24 mx-4">

      <section className='flex gap-6 my-8'>
        <ProfilePicture size="big" />
        <div className='mt-1'>
          <h1 className="text-3xl font-semibold text-white ">{user.name}</h1>
          <p className=" text-sm text-white mb-2 mt-1 ">mGl Member Since {user.createdAt.slice(0, 7)}</p>
          <p className="text-white text-lg ">{user.info}</p>
        </div>
      </section>


      {/* Add an "Edit Profile" button, but require a session for editing */}
      <section className='flex flex-col gap-4 my-8 '>
        {session ? (
          <Link href="/editprofile" >
            <Button label="Edit Profile" color="green"></Button>
          </Link>
        ) : (
          <p className="text-gray-600">You need to be logged in to edit your profile.</p>
        )}
        <Link href={`/gamelist/${user.name}`} >
          <Button label="Game List" color="green"></Button>
        </Link>
      </section>

      <section className="flex flex-col gap-2 my-8">
        <h1 className="text-3xl font-semibold text-white ">Your Recent Games</h1>

        <div className='flex gap-4'>
          {games.map((map) =>
            <div className='bg-white w-full h-28'></div>
          )}
        </div>


      </section>

      <section className="flex flex-col gap-2 my-8">
        <h1 className="text-3xl font-semibold text-white ">Statistics</h1>
        <ul className='bg-grey-dark border-2 border-white text-white rounded-xl p-2'>
          <li>Games Completed: </li>
          <li>Games Playing: </li>
          <li>Games Droped: </li>
          <li>Games In The Backlog: </li>
        </ul>

      </section>

    </div>
  );
};
export default ProfilePage;
