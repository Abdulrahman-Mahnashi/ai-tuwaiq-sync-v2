import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { verifyLogin, createUser, UserData } from "@/services/userService";

export type UserRole = "student" | "supervisor";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole, bootcamp_name?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("tuwaiq_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("tuwaiq_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Simple validation
      if (!email || !password || !role) {
        setIsLoading(false);
        return false;
      }

      // Verify credentials
      const userData = verifyLogin(email, password, role);
      if (!userData) {
        setIsLoading(false);
        return false;
      }

      // Convert UserData to User (without password)
      const newUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      };

      setUser(newUser);
      localStorage.setItem("tuwaiq_user", JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    bootcamp_name?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Simple validation
      if (!email || !password || !name || !role) {
        setIsLoading(false);
        return false;
      }

      // Create user with password
      const userData = createUser(email, password, name, role, bootcamp_name);
      if (!userData) {
        setIsLoading(false);
        return false; // User already exists
      }

      // Convert UserData to User (without password)
      const newUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      };

      setUser(newUser);
      localStorage.setItem("tuwaiq_user", JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tuwaiq_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

