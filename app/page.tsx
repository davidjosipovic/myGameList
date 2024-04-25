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
  const games = ["", "", "", "", "", "", "", "", "", ""]

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

      {isDesktop ? (
        <Image src="/hero-big.svg"
          width={500}
          height={500}
          alt="Hero Image"
          className="w-full h-auto"
          priority

        />
      ) : (
        <Image className="w-full h-auto" src="/hero-small.svg"
          width={500}
          height={500}
          alt="Hero Image"
          priority

        />
      )}


      <div className="flex">
        <div className=" border m-4 lg:ml-16 my-8 p-5 border-white bg-grey-dark text-white rounded-lg text-center w-full lg:w-2/5 ">
          <p>Discover a world of GAMING.</p>
          <p>Track, showcase, and connect with fellow gamers.</p>
        </div>

        {!session && <div className="lg:flex hidden flex-col gap-8 justify-center lg:w-1/5 text-center  ">
          <Link href={"/login"}><Button label="Login" color="green" /></Link>
          <Link href={"/register"}><Button label="Register" color="green" /></Link>
        </div>}

        <div className="lg:block hidden border m-4 lg:mr-16 my-8 p-5 lg:ml-auto border-white  bg-grey-dark text-white rounded-lg text-center lg:w-2/5">
          <p>If you want to be part of this.</p>
          {session && <p>You can start by scrolling down.</p>}
          {!session && <p>You can chose your button.</p>}
        </div>


      </div>


      <section className="px-4">

        <div className="inline-flex items-center w-full mb-2 lg:mb-6">
          <h1 className="w-40 lg:w-56  font-medium  lg:text-2xl text-white lg:px-2  bg-grey-light  ">New Releases</h1>
          <hr className="w-full h-px bg-white border-0 " />
        </div>
        <HomeCarousel filter="new"/>


        <div className="inline-flex items-center  w-full mb-2 lg:mb-6">
          <h1 className="w-32 lg:w-48  font-medium  lg:text-2xl text-white lg:px-2  bg-grey-light ">Top Games</h1>
          <hr className="w-full h-px bg-white border-0 " />
        </div>
        <HomeCarousel filter="top"/>

      </section>

      {!session && <div className=" border m-4 my-8 p-5 lg:hidden border-white bg-grey-dark text-white rounded-lg text-center">
        <p>If you want to be part of this.</p>
        <p>You can chose your button.</p>
      </div>}

      {!session && <div className="flex gap-8 justify-center lg:hidden">
        <Link href={"/"}><Button label="Login" color="green" /></Link>
        <Link href={"/"}><Button label="Register" color="green" /></Link>
      </div>}

    </div>


  );
};

export default MyGameListHome;
