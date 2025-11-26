import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call - in production, use Supabase Auth
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Simple validation
      if (!email || !password) {
        setIsLoading(false);
        return false;
      }

      // For demo: accept any email/password combination
      // In production, verify against Supabase
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split("@")[0],
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

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Simple validation
      if (!email || !password || !name) {
        setIsLoading(false);
        return false;
      }

      // Check if user already exists (simple check)
      const existingUsers = JSON.parse(localStorage.getItem("tuwaiq_users") || "[]");
      if (existingUsers.some((u: User) => u.email === email)) {
        setIsLoading(false);
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
      };

      // Store in users list
      existingUsers.push(newUser);
      localStorage.setItem("tuwaiq_users", JSON.stringify(existingUsers));

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

