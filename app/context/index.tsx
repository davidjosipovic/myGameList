'use client'
import { createContext, useState, useContext, useEffect } from "react";
import { useSession } from 'next-auth/react';

const AppContext = createContext({
    picture: '/Default_pfp.png'
});

export function AppWrapper({ children }: {
    children: React.ReactNode;
}) {
    const [state, setState] = useState({
        picture: '/Default_pfp.png'
    });
    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            const fetchUserData = async function () {
                try {
                    const response = await fetch(`/api/user/${session.user.name}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch user data');
                    }
                    const fetchedData = await response.json();
                    setState((prev) => ({ ...prev, ...fetchedData }));
                } catch (error) {
                    console.error('Error fetching user:', error);
                }
            }

            fetchUserData();
        }
    }, [session?.user.name]);

    // Set picture to '/Default_pfp.png' if it's an empty string
    useEffect(() => {
        if (state.picture === "") {
            setState(prevState => ({ ...prevState, picture: '/Default_pfp.png' }));
        }
    }, [state.picture]);

    return (
        <AppContext.Provider value={state}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext)
}
