// These styles apply to every route in the application
import { Metadata } from "next";
import { Monda } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import './globals.css'
import Navbar from "@/components/Navbar";
import Provider from "@/app/context/client-provider"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Footer from "@/components/Footer";
import ChatbotButton from "@/components/ChatbotButton";
import {AppWrapper} from '@/app/context'

const monda = Monda({
  subsets: ["latin"],
  weight:"400"
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
     
      <body className={`bg-grey-light ${monda.className}`}>
        
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1F1F1F',
              color: '#D9D9D9',
              border: '1px solid #00FFA2',
            },
          }}
        />
        <Suspense fallback="Loading...">
        </Suspense>
        <Provider session={session} >
         <AppWrapper>
        <Navbar/>
        <main className="pt-16">
          {children}
        </main>
        <Footer/>
        <ChatbotButton />
        </AppWrapper>
        </Provider>
    
      </body>
    </html>
  );
}