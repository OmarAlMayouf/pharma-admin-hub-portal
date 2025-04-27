import { createContext, useContext, useEffect, useState } from "react";
import { checkSession, signOut, loadPharmacyData } from "@/services/appwrite";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  pharmacy: {
    id: string;
    name: string;
  } | null;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  pharmacy: null,
  logout: async () => {},
  checkAuth: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    pharmacy: null,
    logout: async () => {},
    checkAuth: async () => {},
  });

  const checkAuth = async () => {
    try {
      const session = await checkSession();
      const pharmacyId = localStorage.getItem("pharmacyId");

      if (session && pharmacyId) {
        const pharmacyData = await loadPharmacyData(pharmacyId);
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: !!pharmacyData,
          isLoading: false,
          pharmacy: pharmacyData,
        }));
      } else {
        await signOut();
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
          pharmacy: null,
        }));
      }
    } catch (error) {
      await signOut();
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        pharmacy: null,
      }));
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem("pharmacySession");
      localStorage.removeItem("pharmacyId");
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        pharmacy: null,
        logout: handleLogout,
        checkAuth,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ ...authState, logout: handleLogout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
