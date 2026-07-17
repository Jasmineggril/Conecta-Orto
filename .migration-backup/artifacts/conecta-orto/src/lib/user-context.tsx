import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserSession {
  id: number;
  name: string;
  email: string;
}

interface UserContextType {
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

const STORAGE_KEY = "conecta_orto_user";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setUser = (u: UserSession | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
