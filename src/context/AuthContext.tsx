
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContextType, User } from "@/types/auth";
import { useToast } from "@/components/ui/use-toast";

// Mock data for demo purposes
const MOCK_USERS = [
  { 
    id: "1", 
    pharmacyId: "PHARM123", 
    password: "admin123", 
    pharmacyName: "HealthCare Pharmacy" 
  },
  { 
    id: "2", 
    pharmacyId: "PHARM456", 
    password: "admin456", 
    pharmacyName: "MediCare Pharmacy" 
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem("pharmacy-user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem("pharmacy-user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (pharmacyId: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Mock authentication logic
      const foundUser = MOCK_USERS.find(
        u => u.pharmacyId === pharmacyId && u.password === password
      );

      if (!foundUser) {
        throw new Error("Invalid pharmacy ID or password");
      }

      const loggedInUser = {
        id: foundUser.id,
        pharmacyId: foundUser.pharmacyId,
        pharmacyName: foundUser.pharmacyName,
      };

      setUser(loggedInUser);
      localStorage.setItem("pharmacy-user", JSON.stringify(loggedInUser));
      toast({
        title: "Login Successful",
        description: `Welcome to ${foundUser.pharmacyName} Admin Portal`,
      });
      navigate("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pharmacy-user");
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out",
    });
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
