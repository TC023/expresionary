import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import apiClient from '../apiClient';

interface User {
    id: string;
    email: string;
    role: 'base'| 'premium'
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            // console.log('token', token);

            try {
                const res = await apiClient.get("/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // console.log(res);
                // console.log(res.data);

                if (res.data) {
                    setUser(res.data)
                }
                
            } catch (err) {
                if (err instanceof Error) {
                    console.error(err.message);
                } else {
                    console.error('An unknown error occurred:', err);
                }
            }
        };

        fetchProfile();
    }, []);
    
    const [user, setUser] = useState<User | null>(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};