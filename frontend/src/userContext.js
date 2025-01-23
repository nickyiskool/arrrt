import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const verifySession = useCallback(async () => {
    try {
      const response = await axios.get('/api/users/verify-session', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.data.isLoggedIn) {
        setUser({ username: response.data.username });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  return (
    <UserContext.Provider value={{ user, setUser, verifySession }}>
      {children}
    </UserContext.Provider>
  );
};
