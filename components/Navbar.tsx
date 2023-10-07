import React, { FC } from 'react';

const Navbar: FC = () => {
  return (
    <nav className="flex items-center justify-between bg-gray-800 p-4 text-white">
      <div className="text-2xl font-bold">MyGameList</div>
      <div className="flex space-x-4">
        <div className="cursor-pointer">Home</div>
        <div className="cursor-pointer">About</div>
        <div className="cursor-pointer">Services</div>
        <div className="cursor-pointer">Profile</div>
      </div>
    </nav>
  );
};


export default Navbar;
