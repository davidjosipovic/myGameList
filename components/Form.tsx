"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import LoadingDots from "@/components/LoadingDots";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation"; // changed `navigation` to `router`

export default function Form({ type }: { type: "login" | "register" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLoading(true);
        const email = e.currentTarget.email.value;
        const name = e.currentTarget.name?.value;  // Only capture name if it exists
        const password = e.currentTarget.password.value;

        if (type === "login") {
          // Use email as a fallback for login if name is not provided
          signIn("credentials", {
            redirect: false,
            email: name ? undefined : email,
            name: name,
            password: password,
          }).then(({ error }) => {
            if (error) {
              setLoading(false);
              toast.error(error);
            } else {
              router.refresh();
              router.push("/");
            }
          });
        } else if (type === "register") {
          fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              name: name,  // Send name for registration
              password: password,
            }),
            
          }).then(async (res) => {
            setLoading(false);
            if (res.status === 200) {
              toast.success("Account created! Redirecting to login...");
              setTimeout(() => {
                router.push("/login");
              }, 2000);
            } else {
              const { error } = await res.json();
              toast.error(error);
            }
          });
        }
      }}
      className=" flex flex-col z-0 gap-4  py-12 "
    >
      
      <div>
      <p className="text-sm text-white mb-2">{type==="login"?"Use your email and password to sign in":"Create an account with your email, username and password"}</p>

        <label htmlFor="email" className="block text-md text-white ">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 block w-full appearance-none  border px-3 py-2 rounded-lg text-white  border-white bg-grey-dark shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
        />
      </div>
      {type === "register" && (
        <div>
          <label htmlFor="name" className=" block text-md text-white">
            Username
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="mt-1 block px-3 py-2  w-full appearance-none rounded-lg text-white border border-white bg-grey-dark shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          />
        </div>
      )}
      <div>
        <label
          htmlFor="password"
          className="block text-md text-white"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 block w-full appearance-none text-white rounded-lg border border-white bg-grey-dark px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
        />
      </div>
      <div className="flex items-center">
        <button
        disabled={loading}
        className={`${
          loading
            ? "cursor-not-allowed  bg-grey-dark"
            : "border-black bg-black text-grey-dark hover:bg-green-dark hover:text-black"
        } bg-green-light font-bold w-1/3  mr-4  flex h-10  items-center  justify-center rounded-lg border text-xl transition-all focus:outline-none`}
      >
        {loading ? (
          <LoadingDots color="#808080" />
        ) : (
          <p>{type === "login" ? "Sign In" : "Sign Up"}</p>
        )}
      </button>
      {type === "login" ? (
        <p className="text-center text-sm text-white  w-2/3">
          Don&apos;t have an account?{" "}
          <Link className=" underline text-white" href="/register">Sign up</Link>{" "}
          for free.
        </p>
      ) : (
        <p className="text-center text-sm text-white w-2/3">
          Already have an account?{" "}
          <Link className=" underline text-white" href="/login">Sign in</Link>{" "}instead.
        </p>
      )}
      </div>
      
    </form>
  );
}
