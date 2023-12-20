"use client";
import Link from "next/link";
import React, { FC, useEffect, useRef, useState } from "react";
import Image from "next/image";
import SignOut from "./SignOut";
import { useSession } from "next-auth/react";
import SearchGameComponent from "./SearchGame";

const Navbar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 w-full bg-gray-900 shadow-lg z-50">
      <nav className="flex items-center justify-between  py-2 text-white container mx-auto z-10">
        <Link className="flex items-center" href="/">
          <Image src="/logo.png" width={50} height={50} alt="Logo" />
          <div className="text-3xl pl-2 font-bold">myGameList</div>
        </Link>

        <div className="relative lg:hidden flex space-x-4 items-center">
          {/* Search Icon */}
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setIsOpen(false);
            }}
            className="focus:outline-none z-20"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6M4 4h13m1 1v13M4 4l5 5M4 4l5-5"
              ></path>
            </svg>
          </button>

          {/* Dropdown Search Bar */}
          {isSearchOpen && (
            <div className="absolute  mt-32 right-0 w-60 bg-white text-black rounded-lg shadow-xl">
              <SearchGameComponent />
            </div>
          )}

          {/* Hamburger Icon */}
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              setIsSearchOpen(false);
            }}
            className="focus:outline-none z-20"
          >
            <svg
              className="w-10 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className=" text-xl gap-10 fixed top-16  w-full -left-4 h-screen bg-white text-black z-20 flex flex-col justify-center items-center">
              <div>
                {!session && (
                  <Link href="/login">
                    <div
                      className=" px-32 py-2 cursor-pointer hover:bg-gray-200 rounded w-full text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign in
                    </div>
                  </Link>
                )}
              </div>
              <div>
                {!session && (
                  <Link href="/register">
                    <div
                      className="py-2 px-32 cursor-pointer hover:bg-gray-200 rounded w-full text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign up
                    </div>
                  </Link>
                )}
              </div>
              <Link href="/topgames">
                <div
                  className="py-2 cursor-pointer hover:bg-gray-200 rounded w-full px-32 text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Top Games
                </div>
              </Link>
              <div>
                {session && (
                  <Link href={`/profile/${session.user.name}`}>
                    <div
                      className="py-2 px-32 cursor-pointer hover:bg-gray-200 rounded w-full text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      {session.user.name}
                    </div>
                  </Link>
                )}
              </div>
              <div>{session && <SignOut />}</div>
            </div>
          )}
        </div>

        {/* Regular menu for larger screens */}
        <div className="hidden lg:flex items-center">
          <SearchGameComponent />
          <Link href="/">
            <div className="hover:text-gray-300 pr-2 pl-4">Home</div>
          </Link>
          <div>
            {!session && (
              <Link href="/login">
                <div className="hover:text-gray-300 px-2">Sign in</div>
              </Link>
            )}
          </div>
          <div>
            {!session && (
              <Link href="/register">
                <div className="hover:text-gray-300 px-2">Sign up</div>
              </Link>
            )}
          </div>
          <Link href="/topgames">
            <div className="hover:text-gray-300 px-2">Top Games</div>
          </Link>

          {session && (
            <div
              className={`px-2 cursor-pointer hover:text-gray-300 ${
                !isUserMenuOpen ? "cursor-pointer" : ""
              }`}
              onClick={() => {
                if (!isUserMenuOpen) {
                  setIsUserMenuOpen(!isUserMenuOpen);
                }
              }}
            >
              {session.user.name}
            </div>
          )}

          <div className="relative">
            {isUserMenuOpen && (
              <div
                ref={userMenuRef}
                className="absolute top-10 right-6 mt-2 w-48 bg-gray-900 text-white rounded-lg shadow-xl"
              >
                <div
                  onClick={() => {
                    setIsUserMenuOpen(false);
                  }}
                  className="py-2 text-center cursor-pointer hover:bg-gray-200 hover:text-black"
                >
                  {session && (
                    <Link href={`/profile/${session.user.name}`}>
                      <div className="">Profile</div>
                    </Link>
                  )}
                </div>
                <div
                  onClick={() => {
                    setIsUserMenuOpen(false);
                  }}
                  className="py-2 cursor-pointer hover:bg-gray-200 hover:text-black"
                >
                  {session && <SignOut />}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
