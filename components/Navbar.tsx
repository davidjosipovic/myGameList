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
  const [isChartsMenuOpen, setIsChartsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
        setIsChartsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center justify-between fixed top-0 w-full text-white bg-grey-dark z-20 py-3 px-4 lg:px-6 shadow-xl border-b border-white/10">

      {/* Logo and Name */}
      <Link className="flex items-center hover:opacity-80 transition-opacity" href="/">
        <Image priority src="/logo.png" width={40} height={40} alt="Logo" className="w-10 h-10" />
        <div className="text-xl lg:hidden pl-3 font-bold">mGL</div>
        <div className="text-xl hidden lg:inline pl-3 font-bold">myGameList</div>
      </Link>

        {/* Regular menu for smaller screens */}
      <div className="relative lg:hidden flex gap-3 items-center">

        {/* Search Icon */}
        <button
          onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            setIsHamburgerMenuOpen(false);
          }}
          className="focus:outline-none p-2 hover:bg-grey-light rounded-lg transition-colors"
        >
          <Image
            src={"/searchIcon.svg"}
            alt="Search Button"
            width={24}
            height={24}
          />
        </button>

        {/* Dropdown Search Bar */}
        <SearchGame setIsSearchOpen={setIsSearchOpen}
          isSearchOpen={isSearchOpen} screen="small" />

        {/* Profile Icon */}
        <Link href={session ? `/profile/${session.user.name}` : "login"} className="hover:opacity-80 transition-opacity">
          <ProfilePicture size="small" />
        </Link>


        {/* Hamburger Icon */}
        <button
          onClick={() => {
            setIsHamburgerMenuOpen(!isHamburgerMenuOpen);
            setIsSearchOpen(false);
          }}
          className="focus:outline-none p-2 hover:bg-grey-light rounded-lg transition-colors"
        >
          <Image src={"/hamburgerMenuIcon.svg"}
            alt="Hamburger Menu Button"
            width={28}
            height={28}
          />
        </button>

        {/* Dropdown Menu */}
        <div className={` text-lg px-6 gap-5 fixed top-0 border-l border-white/20  ${isHamburgerMenuOpen ? slidemenu.open : slidemenu.close}  h-screen bg-grey-dark text-white  z-20 flex flex-col shadow-2xl`}>
          <div onClick={() => setIsHamburgerMenuOpen(false)} className="justify-self-end self-end cursor-pointer py-4 px-4 text-2xl hover:text-green-light transition-colors">✕</div>

          <div className="flex gap-3 mb-6 items-center">
            <ProfilePicture size="small" />
            <p className="font-semibold">Hello, {session ? session.user.name : "user"}</p>
          </div>

          {session ? SESSION_NAV_LINKS.map((link) => {
            if (link.key === 'profile') {
              link.href = `/profile/${session.user.name}`
            }
            else if (link.key === 'gamelist') {
              link.href = `/gamelist/${session.user.name}`
            }
            else if (link.key === 'signout') {
              return(<Link className="hover:text-green-light transition-colors py-2" href={link.href} key={link.key} onClick={() => {setIsHamburgerMenuOpen(false)
                signOut()
              }} >{link.label}</Link>)
            }
            return (<Link className="hover:text-green-light transition-colors py-2" href={link.href} key={link.key} onClick={() => setIsHamburgerMenuOpen(false)} >{link.label}</Link>)
          }) :
            NAV_LINKS.map((link) => (<Link className="hover:text-green-light transition-colors py-2" href={link.href} key={link.key} onClick={() => setIsHamburgerMenuOpen(false)}>{link.label}</Link>))
          }
          
        </div>

      </div>

      {/* Regular menu for larger screens */}
      <div className="hidden lg:flex items-center gap-4">
        <SearchGame screen="large" />

        <Link href="/">
          <div className="hover:text-green-light transition-colors px-3 py-2 rounded-lg hover:bg-grey-light">Home</div>
        </Link>

        <div onClick={()=>{
          if(!isChartsMenuOpen){
          setIsChartsMenuOpen(!isChartsMenuOpen)}
          }} className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${isChartsMenuOpen ? "text-green-light bg-grey-light" : "hover:text-green-light hover:bg-grey-light"}`}>Charts</div>

        {/* Welcome message and dropdown button*/}
        {session ? <div
          className={`px-3 py-2 rounded-lg cursor-pointer flex gap-2 items-center transition-colors ${isUserMenuOpen ? "text-green-light bg-grey-light" : "hover:text-green-light hover:bg-grey-light"}`}
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
            className={`px-3 py-2 rounded-lg cursor-pointer flex gap-2 items-center transition-colors hover:text-green-light hover:bg-grey-light`}
            onClick={() => {
              if (!isUserMenuOpen) {
                setIsUserMenuOpen(!isUserMenuOpen);
              }
            }}>Hello, user<ProfilePicture  size="small" /></div>}
        
            {/* Charts Menu Dropdown*/}
        <div className="relative">
          {isChartsMenuOpen && (
            <div ref={userMenuRef} className="absolute flex flex-col top-full right-0 mt-6 w-52 bg-grey-dark border border-white/10 rounded-lg text-white shadow-xl overflow-hidden">
             <Link className="p-4 hover:bg-grey-light hover:text-green-light transition-colors border-b border-white/10" href={"/charts/top"} onClick={() => setIsChartsMenuOpen(false)}>Top 100 Games</Link>
             <Link className="p-4 hover:bg-grey-light hover:text-green-light transition-colors" href={"/charts/popular"} onClick={() => setIsChartsMenuOpen(false)}>Most Popular Games</Link>
            </div>
          )}
        </div>

        {/* User Menu Dropdown*/}
        <div className="relative">
          {isUserMenuOpen && (
            <div ref={userMenuRef} className="absolute flex flex-col top-full right-0 mt-6 w-52 bg-grey-dark border border-white/10 rounded-lg text-white shadow-xl overflow-hidden">
              {session? SESSION_USER_MENU_DROPDOWN.map((link, index)=>{
                 if (link.key === 'profile') {
                  link.href = `/profile/${session.user.name}`
                }
                else if (link.key === 'gamelist') {
                  link.href = `/gamelist/${session.user.name}`
                }

                else if (link.key === 'signout') {
                  return(<Link className="p-4 hover:bg-grey-light hover:text-green-light transition-colors border-b border-white/10 last:border-0" href={link.href} key={link.key} onClick={() => {setIsUserMenuOpen(false)
                    signOut()
                  }} >{link.label}</Link>)
                }
                return(<Link className="p-4 hover:bg-grey-light hover:text-green-light transition-colors border-b border-white/10 last:border-0" href={link.href} key={link.key} onClick={()=>setIsUserMenuOpen(false)}>{link.label}</Link>)}):
                USER_MENU_DROPDOWN.map((link, index) => (<Link className="p-4 hover:bg-grey-light hover:text-green-light transition-colors border-b border-white/10 last:border-0" href={link.href} key={link.key} onClick={() => setIsUserMenuOpen(false)}>{link.label}</Link>))
                }
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
