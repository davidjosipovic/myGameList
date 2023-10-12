// These styles apply to every route in the application
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import AuthStatus from "@/components/auth-status";
import { Suspense } from "react";
import './globals.css'
import Navbar from "@/components/Navbar";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const title = "myGameList";
const description =
  "This is a Next.js starter kit that uses Next-Auth for simple email + password login and a Postgres database to persist the data.";

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
  return (
    <html lang="en">
      <body className={inter.variable}>
        
        <Toaster />
        <Suspense fallback="Loading...">
          
        </Suspense>
       
        <Navbar/>
        {children}
       
        
      </body>
    </html>
  );
}