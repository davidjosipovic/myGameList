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
      <div>

        <div className="mt-24 mx-4 ">

          <section className='flex gap-6 my-8 lg:justify-center xl:mx-80'>
          <div  className="block relative  ">
            <div className={` object-cover rounded-full w-32 h-32 bg-grey-dark  `}   />
        </div>
            <div className='mt-2'>
              <div className="  bg-grey-dark w-20 h-8"></div>
              <div className="  bg-grey-dark  mb-2 mt-1 w-28 h-6 "></div>
              <div className="bg-grey-dark   w-40 h-6 "></div>
            </div>
          </section>


          <section className='flex flex-col gap-4 lg:flex-row lg:justify-center lg:gap-16   my-8 '>
            <div className='bg-grey-dark w-32 h-10'></div>
            <div className='bg-grey-dark w-32 h-10'></div>
          </section>

          <section className="flex flex-col gap-2 my-8">
          <div className="  bg-grey-dark w-40 h-8"></div>

            <div className='flex gap-4'>
              {fakegames.map((_,index) =>
                < div className ='bg-grey-dark w-full h-28 lg:h-60' key={index}></div>
              )}
            </div>


          </section>

          <section className="flex flex-col gap-4 lg:my-12 lg:items-center">
          <div className="  bg-grey-dark w-40 h-8"></div>
            <ul className='bg-grey-dark  w-full h-40  p-2'>
             
            </ul>

          </section>

        </div>

      </div>);
  }
  else if (user.name === "DemoUser") {
    return <div  className='mt-40 h-96 mx-4'>
      <p className='text-white text-xl font-bold text-center'>User does not exist</p>
    </div>;}
  else 
  {
  return (
    <div className="mt-24 mx-4">

      <section className='flex gap-6 my-8 lg:justify-center xl:mx-80 '>
        <ProfilePicture className=" " size="big" />
        <div className='mt-1 w-2/3  lg:w-2/4  '>
          <h1 className="text-3xl font-semibold text-white ">{user.name}</h1>
          <p className=" text-sm text-white mb-2 mt-1 ">mGl Member Since {user.createdAt.slice(0, 7)}</p>
          <p className="text-white text-md  ">{user.info}</p>
        </div>
      </section>


      {/* Add an "Edit Profile" button, but require a session for editing */}
      <section className='flex flex-col gap-4 lg:flex-row lg:justify-center lg:gap-16   my-8 '>
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

      <RecentGames id={params.id} setGames={setGames}/>

      <section className="flex flex-col gap-4 lg:my-12 lg:items-center">
        <h1 className="text-3xl font-semibold text-white ">Statistics</h1>
     {games &&   <ul className='bg-grey-dark border-2 border-white sm:w-2/3 xl:w-1/3 text-white rounded-xl p-2'>

          <li>Games Completed:{Object.values(games).filter((game)=>game.status==="Completed").length} </li>
          <li>Games Playing:{Object.values(games).filter((game)=>game.status==="Playing").length} </li>
          <li>Games Droped:{Object.values(games).filter((game)=>game.status==="Dropped").length} </li>
          <li>Games In The Backlog:{Object.values(games).filter((game)=>game.status==="Backlog").length} </li>

        </ul>}

      </section>

    </div>
  );
}};
export default ProfilePage;
