import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User, AppRole } from "@/shared/types";
import { authService } from "../services/authService";
import { tokenStorage } from "@/shared/services/api.client";

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signOut: () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (newUser: User | null) => {
    if (newUser) {
      setUser(newUser);
      setRole(newUser.role);
    } else {
      tokenStorage.clearTokens();
      localStorage.removeItem("smtrack_user");
      setUser(null);
      setRole(null);
    }
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setRole(currentUser.role);
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    authService.logout();
    updateUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
