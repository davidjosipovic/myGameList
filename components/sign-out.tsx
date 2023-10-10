"use client";
import { signOut } from "next-auth/react";

export default function SignOut() {
  return (
    <button
      className="hover:bg-gray-200 p-1 rounded"
      onClick={() => signOut()}
    >
      Sign out
    </button>
  );
}