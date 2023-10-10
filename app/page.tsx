import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen bg-black">
      <div className="w-screen h-screen flex flex-col justify-center items-center">
       
        <div className="text-center max-w-screen-sm mb-10">
          <h1 className="text-stone-200 font-bold text-2xl">
            MyGameList
          </h1>
          <p className="text-stone-400 mt-5">
            Ovo je moj projekt
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/protected"
            prefetch={false} // workaround until https://github.com/vercel/vercel/pull/8978 is deployed
            className="text-stone-400 underline hover:text-stone-200 transition-all"
          >
             <button className="btn rounded  bg-white text-black">Login</button>
          </Link>
          
        </div>
      </div>
    </div>
  );
}