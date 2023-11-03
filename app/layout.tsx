// These styles apply to every route in the application
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import './globals.css'
import Navbar from "@/components/Navbar";
import Provider from "@/app/context/client-provider"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const title = "myGameList";
const description ="myGameList is a dedicated platform for gamers to track their completed games."
  

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL("https://chat-app-pi-lac.vercel.app/"),
  themeColor: "#FFF",
};

export default async function RootLayout({
  children,
  
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en">
     
      <body className={inter.variable}>
        
        <Toaster />
        <Suspense fallback="Loading...">
        </Suspense>
        <Provider session={session}>
        <Navbar/>
        {children}
        <Footer/>
        </Provider>
       
        
      </body>
     
    </html>
  );
}