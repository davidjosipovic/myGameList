'use client'
import React, { FC, useState } from 'react';

const Navbar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='bg-gray-800'>
    <nav className="flex items-center justify-between bg-gray-800 py-4 text-white container mx-auto ">
      
      <div className="text-2xl font-bold px-0">MyGameList</div>

      <div className="relative lg:hidden">
        {/* Hamburger Icon */}
        <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 py-2 bg-white text-black rounded-lg shadow-xl">
            <div className="cursor-pointer hover:bg-gray-200 p-2 rounded" onClick={() => setIsOpen(false)}>Home</div>
            <div className="cursor-pointer hover:bg-gray-200 p-2 rounded" onClick={() => setIsOpen(false)}>About</div>
            <div className="cursor-pointer hover:bg-gray-200 p-2 rounded" onClick={() => setIsOpen(false)}>Services</div>
            <div className="cursor-pointer hover:bg-gray-200 p-2 rounded" onClick={() => setIsOpen(false)}>Profile</div>
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