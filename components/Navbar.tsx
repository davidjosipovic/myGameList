'use client'
import Link from 'next/link';
import React, { FC, useState } from 'react';
import Image from 'next/image';
import SignOut from './sign-out';
import { useSession } from "next-auth/react"

const Navbar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: session } = useSession()
  

  return (

    <div className='fixed top-0 w-full bg-gray-900 shadow-lg z-50'>
      <nav className="flex items-center justify-between  py-4 text-white container mx-auto z-10">
      <Link className='flex items-center' href="/"><Image
          src="/logo.png"
          width={50}
          height={50}
          alt='Logo'
          />
          <div className="text-3xl pl-2 font-bold">myGameList</div></Link>
        
<div className="relative lg:hidden flex space-x-4 items-center">
          {/* Search Icon */}
          <button  onClick={() => {setIsSearchOpen(!isSearchOpen);setIsOpen(false)}} className="focus:outline-none z-20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6M4 4h13m1 1v13M4 4l5 5M4 4l5-5"></path>
            </svg>
          </button>
          
          {/* Dropdown Search Bar */}
          {isSearchOpen && (
            <div className="absolute  mt-32 right-0  w-96 py-2 bg-white text-black rounded-lg shadow-xl">
              <input type="text" className="p-2 w-full rounded" placeholder="Search games..."/>
            </div>
          )}

          {/* Hamburger Icon */}
          <button onClick={() => {setIsOpen(!isOpen);setIsSearchOpen(false)}} className="focus:outline-none z-20">
            <svg className="w-10 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="fixed top-16 left-0 w-full h-screen bg-white text-black z-20 flex flex-col justify-center items-center">
              {session && (
            <div className="text-gray-300">{session.user.name}</div>
          )}
              <div>{!session && (<Link href="/login"><div className="cursor-pointer hover:bg-gray-200 p-2 rounded w-full text-center" onClick={() => setIsOpen(false)}>Sign in</div></Link>)}</div>
              <div>{!session && (<Link href="/register"><div className="cursor-pointer hover:bg-gray-200 p-2 rounded w-full text-center" onClick={() => setIsOpen(false)}>Sign up</div></Link>)}</div>
              <Link href="/topgames"><div className="cursor-pointer hover:bg-gray-200 p-2 rounded w-full text-center" onClick={() => setIsOpen(false)}>Top Games</div></Link>
              <div>{session && (<Link href={`/profile/${session.user.name}`}><div className="cursor-pointer hover:bg-gray-200 p-2 rounded w-full text-center" onClick={() => setIsOpen(false)}>Profile</div></Link>)}</div>
              <div>{session && (<SignOut/>)}</div>
              
            </div>
          )}

            
        </div>



        {/* Regular menu for larger screens */}
        <div className="hidden lg:flex space-x-4 items-center">
          <input type="text" className="p-2 bg-white rounded text-black shadow" placeholder="Search games..."/>
          
          <div>{!session && (<Link href="/login"><div className="hover:text-gray-300">Sign in</div></Link>)}</div>
          <div>{!session && (<Link href="/register"><div className="hover:text-gray-300">Sign up</div></Link>)}</div>
          <Link href="/topgames"><div className="hover:text-gray-300">Top Games</div></Link>
          
          <div>{session && (<Link href={`/profile/${session.user.name}`}><div className="hover:text-gray-300">Profile</div></Link>)}</div>
          <div>{session && (<SignOut />)}</div>
          {session && (
            <div className="text-gray-300">{session.user.name}</div>
          )}
        </div>
        
      </nav>
    </div>
  );
};

export default Navbar;
