"use client";
import { signOut } from "next-auth/react";

export default function SignOut() {
  return (
    <button
      className="hover:text-gray-200"
      onClick={() => signOut()}
    >
      Sign out
    </button>
  );
}