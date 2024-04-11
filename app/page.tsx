"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Button from "@/components/Button";

const MyGameListHome: React.FC = () => {
  // Check user session
  const { data: session } = useSession();
  const [isDesktop, setDesktop] = useState(false);
  const games=["","",""]

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
    <div className="my-12">
      <div className=" ">
        {isDesktop ? (
          <Image  src={"/hero-big.svg"}
            width={500}
            height={500}
            alt="Hero Image"
            layout="responsive"

          />
        ) : (
          <Image className="" src={"/hero-small.svg"}
            width={500}
            height={500}
            layout="responsive"
            alt="Hero Image"

          />
        )}
      </div>


      <div className=" border m-4 my-8 p-5 border-white bg-grey-dark text-white rounded-lg text-center">
        <p>Discover a world of GAMING.</p>
        <p>Track, showcase, and connect with fellow gamers.</p></div>

      <section className="px-4">

        <div className="inline-flex items-center  w-full mb-2">
          <h1 className="w-40 font-medium text-gray-900  bg-grey-light  text-white">New Releases</h1>
          <hr className="w-full h-px bg-white border-0 " />
          {/*Carusel*/}
        </div>

        <div className='flex gap-4 mb-8'>
        {games.map((game)=>
        <div className='bg-white w-full h-40'></div>
       )}
       </div>


        <div className="inline-flex items-center  w-full mb-2">
          <h1 className="w-40 font-medium text-gray-900  bg-grey-light  text-white">Top Games</h1>
          <hr className="w-full h-px bg-white border-0 " />
          {/*Carusel*/}
        </div>
        <div className='flex gap-4'>
        {games.map((game)=>
        <div className='bg-white w-full h-40'></div>
       )}
       </div>
      </section>

      <div className=" border m-4 my-8 p-5 border-white bg-grey-dark text-white rounded-lg text-center">
        <p>If you want to be part of this.</p>
        <p>You can chose your button.</p>
      </div>

      <div className="flex gap-8 justify-center">
        <Button label="Login" color="green" />
        <Button label="Register" color="green"/>
      </div>

    </div>


  );
};

export default MyGameListHome;
