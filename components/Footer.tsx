import React from "react";
import Image from "next/image";

const Footer: React.FC = () => {
  return (
    <div className="bg-black py-8">
      <div className="container mx-auto flex flex-col items-center">
        <div className="text-white text-center">
          <div className="flex">
            <Image src="/logo.png" width={50} height={50} alt="Logo" />
            <div className="text-3xl pl-2 font-bold">myGameList</div>
          </div>

          <p className="mt-2">123 Main Street, City, Country</p>
          <p>myGameList.info@gmail.com</p>
        </div>

        <div className="mt-4">
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-gray-300">
              Home
            </a>
            <a href="#" className="text-white hover:text-gray-300">
              About
            </a>
            <a href="#" className="text-white hover:text-gray-300">
              Services
            </a>
            <a href="#" className="text-white hover:text-gray-300">
              Contact
            </a>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-500">
            © 2023 myGameList. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
