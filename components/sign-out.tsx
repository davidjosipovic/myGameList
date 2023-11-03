"use client";
import { signOut } from "next-auth/react";

export default function SignOut() {
  return (
    <button
      className="py-2 px-32 lg:px-0 cursor-pointer hover:bg-gray-200 rounded w-full text-center"
      onClick={() => signOut()}
    >
      Sign out
    </button>
  );
}