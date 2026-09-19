import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User, AppRole } from "@/types";

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, role: null, loading: true,
  signOut: () => {},
  setUser: () => {},
});

const STORAGE_KEY = "smtrack_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (newUser: User | null) => {
    if (newUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      setRole(newUser.role);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setRole(null);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(parsedUser.role);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    updateUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
