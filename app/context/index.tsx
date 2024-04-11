'use client'
import { createContext, useState, useContext, useEffect } from "react";
import { useSession } from 'next-auth/react';

const AppContext=createContext({
    picture:''
});

export function AppWrapper({children}:{
    children:React.ReactNode;
}){
    let[state,setState]=useState({
        picture:'/Default_pfp.png'
    })
    const { data: session } = useSession();
    if(session){
      useEffect(() => {
        async function fetchUserData() {
          try {
            const response = await fetch(`/api/user/${encodeURIComponent(session.user.name)}`);
            if (!response.ok) {
              throw new Error('Failed to fetch user data');
            }
            const fetchedData = await response.json();
            setState((prev) => ({ ...state, ...fetchedData }));
            console.log('Fetched Data:', fetchedData);
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        }
        
        fetchUserData();
      }, [session.user.name]);}
    



    return(
        <AppContext.Provider value={state}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext(){
return useContext(AppContext)
}


