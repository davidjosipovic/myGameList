import React from "react";
import Image from "next/image";

const Footer: React.FC = () => {
  
  var year= new Date().getFullYear();

  return (
    <div className=" bg-grey-dark py-8  flex flex-col items-center">

      <div className="text-white text-center">
        <div className="flex">
          <Image priority src="/logo.png" width={50} height={50} alt="Logo" className="w-auto h-auto" />
          <div className="text-3xl pl-2 font-bold">myGameList</div>
        </div>

        <p className="mt-2">123 Main Street, City, Country</p>
        <p>myGameList.info@gmail.com</p>
      </div>


      <div className="flex space-x-4 mt-4">
        <a href="#" className="text-white hover:text-gray-300">
          Home
        </a>
        <a href="#" className="text-white hover:text-gray-300">
          About
        </a>

      </div>

      <div className="mt-4">
        <p className="text-white">
          © {year} myGameList. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
