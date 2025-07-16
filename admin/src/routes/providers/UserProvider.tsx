import { createContext, useEffect, useState } from 'react';
import type { PropsWithChildren, Dispatch } from 'react';
import axiosInstance from 'src/services/axios';
import type { User } from 'src/types/user';

interface IAuthContext {
  user: User | null;
  setUser: Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<IAuthContext>({
  user: null,
  setUser: () => {},
});

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    axiosInstance
      .get('/users/profile')
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        localStorage.removeItem('token');
        console.log('Get user failed: ', error);
      });
  }, []);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}
