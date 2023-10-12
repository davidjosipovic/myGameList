'use client'
import Link from 'next/link';
import React, { FC, useState } from 'react';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Image from 'next/image';




const Navbar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
 
  
  
  return (
    <div className='bg-gray-800 '>
      <nav className="flex items-center justify-between bg-gray-800 py-4 text-white container mx-auto z-10">
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
            <div className="fixed top-16 left-0 w-full h-screen bg-white text-black z-10 flex flex-col justify-center items-center">
              <Link href="/login"><div className="cursor-pointer hover:bg-gray-200 p-2 rounded w-full text-center" onClick={() => setIsOpen(false)}>Sign in</div></Link>
              <Link href="/register"><div className="cursor-pointer hover:bg-gray-200 p-2 rounded w-full text-center" onClick={() => setIsOpen(false)}>Sign up</div></Link>
              <Link href="/profile"><div className="cursor-pointer hover:bg-gray-200 p-2 rounded w-full text-center" onClick={() => setIsOpen(false)}>Profile</div></Link>
            </div>
          )}
        </div>

        {/* Regular menu for larger screens */}
        <div className="hidden lg:flex space-x-4">
          <div className="cursor-pointer">Home</div>
          <div className="cursor-pointer">About</div>
          <div className="cursor-pointer">Services</div>
          <div className="cursor-pointer">Profile</div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
