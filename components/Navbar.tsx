"use client";
import Link from "next/link";
import React, { FC, useEffect, useRef, useState } from "react";
import Image from "next/image";

import { signOut, useSession } from "next-auth/react";
import SearchGame from "./SearchGame";
import ProfilePicture from "./ProfilePicture";
import slidemenu from "./SlidingMenu.module.css"
import { NAV_LINKS, SESSION_NAV_LINKS, SESSION_USER_MENU_DROPDOWN, USER_MENU_DROPDOWN } from "@/constants";

const Navbar: FC = () => {
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center justify-between fixed top-0 w-full  text-white bg-grey-light  z-10 py-2 px-4">

      {/* Logo and Name */}
      <Link className="flex items-center" href="/">
        <Image priority src="/logo.png" width={50} height={50} alt="Logo" className="w-auto h-auto" />
        <div className="text-3xl lg:hidden pl-2 font-bold">mGL</div>
        <div className="text-3xl hidden lg:inline  pl-2 font-bold">myGameList</div>
      </Link>

        {/* Regular menu for smaller screens */}
      <div className="relative lg:hidden flex gap-4 items-center">

        {/* Search Icon */}
        <button
          onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            setIsHamburgerMenuOpen(false);
          }}
          className="focus:outline-none  "
        >
          <Image
            src={"/searchIcon.svg"}
            alt="Search Button"
            width={30}
            height={30}
          ></Image>
        </button>

        {/* Dropdown Search Bar */}
        {isSearchOpen && <SearchGame setIsSearchOpen={setIsSearchOpen}
          isSearchOpen={isSearchOpen} screen="small" />}

        {/* Profile Icon */}
        <Link href={session ? `/profile/${session.user.name}` : "login"}>
          <ProfilePicture size="small" />
        </Link>


        {/* Hamburger Icon */}
        <button
          onClick={() => {
            setIsHamburgerMenuOpen(!isHamburgerMenuOpen);
            setIsSearchOpen(false);
          }}
          className="focus:outline-none "
        >
          <Image src={"/hamburgerMenuIcon.svg"}
            alt="Hamburger Menu Button"
            width={35}
            height={35}></Image>
        </button>

        {/* Dropdown Menu */}
        <div className={` text-xl px-4 gap-4 fixed top-0   ${isHamburgerMenuOpen ? slidemenu.open : slidemenu.close}  h-screen bg-grey-light text-white  z-20 flex flex-col `}>
          <div onClick={() => setIsHamburgerMenuOpen(false)} className=" justify-self-end self-end cursor-pointer py-2 px-4">X</div>

          <div className="flex gap-2 mb-8">
            <ProfilePicture size="small" />
            <p>Hello, {session ? session.user.name : "user"}</p>
          </div>

          {session ? SESSION_NAV_LINKS.map((link) => {
            if (link.key === 'profile') {
              link.href = `/profile/${session.user.name}`
            }
            else if (link.key === 'signout') {
              return(<Link href={link.href} key={link.key} onClick={() => {setIsHamburgerMenuOpen(false)
                signOut()
              }} >{link.label}</Link>)
            }
            return (<Link href={link.href} key={link.key} onClick={() => setIsHamburgerMenuOpen(false)} >{link.label}</Link>)
          }) :
            NAV_LINKS.map((link) => (<Link href={link.href} key={link.key} onClick={() => setIsHamburgerMenuOpen(false)}>{link.label}</Link>))
          }
          
        </div>

      </div>

      {/* Regular menu for larger screens */}
      <div className="hidden lg:flex items-center">
        <SearchGame screen="large" />

        <Link href="/">
          <div className="hover:text-gray-300 pr-2 pl-4">Home</div>
        </Link>

        <div className="hover:text-gray-300 px-2">Charts</div>

        {/* Welcome message and dropdown button*/}
        {session ? <div
          className={`px-2 cursor-pointer flex gap-2 items-center hover:text-gray-300 ${!isUserMenuOpen ? "cursor-pointer" : ""
            }`}
          onClick={() => {
            if (!isUserMenuOpen) {
              setIsUserMenuOpen(!isUserMenuOpen);
            }
          }}
        >
          Hello, {session.user.name}
          <ProfilePicture size="small"/>
        </div> :
          <div
            className={`px-2 cursor-pointer flex gap-2 items-center hover:text-gray-300 ${!isUserMenuOpen ? "cursor-pointer" : ""}`}
            onClick={() => {
              if (!isUserMenuOpen) {
                setIsUserMenuOpen(!isUserMenuOpen);
              }
            }}>Hello, user<ProfilePicture  size="small" /></div>}
        
        {/* User Menu Dropdown*/}
        <div className="relative">
          {isUserMenuOpen && (
            <div ref={userMenuRef} className="absolute flex flex-col top-10 items-end right-6 mt-2 w-40 bg-grey-light text-white rounded-lg shadow-xl">
              {session? SESSION_USER_MENU_DROPDOWN.map((link)=>{
                 if (link.key === 'profile') {
                  link.href = `/profile/${session.user.name}`
                }
                else if (link.key === 'signout') {
                  return(<Link className="p-2" href={link.href} key={link.key} onClick={() => {setIsUserMenuOpen(false)
                    signOut()
                  }} >{link.label}</Link>)
                }
                return(<Link className="p-2" href={link.href} key={link.key} onClick={()=>setIsUserMenuOpen(false)}>{link.label}</Link>)}):
                USER_MENU_DROPDOWN.map((link) => (<Link className="p-2" href={link.href} key={link.key} onClick={() => setIsUserMenuOpen(false)}>{link.label}</Link>))
                }
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
