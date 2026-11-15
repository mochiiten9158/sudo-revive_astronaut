
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import {
  login as loginService,
  logout as logoutService,
  type AstronautProfile,
} from "../services/auth";

interface AuthContextType {
  astronaut: AstronautProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (astronautId: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [astronaut, setAstronaut] =
    useState<AstronautProfile | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (
    astronautId: string,
    password: string
  ) => {
    setIsLoading(true);

    try {
      const profile = await loginService(astronautId, password);
      setAstronaut(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logoutService();
    setAstronaut(null);
  };

  return (
    <AuthContext.Provider
      value={{
        astronaut,
        isAuthenticated: astronaut !== null,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
