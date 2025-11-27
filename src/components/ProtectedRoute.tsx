import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const [waitingForUser, setWaitingForUser] = useState(false);

  // Give a small grace period after loading completes to allow user state to update
  useEffect(() => {
    if (!isLoading && !user) {
      const timer = setTimeout(() => {
        setWaitingForUser(true);
      }, 200);
      return () => clearTimeout(timer);
    } else if (user) {
      setWaitingForUser(false);
    }
  }, [isLoading, user]);

  if (isLoading || (!user && !waitingForUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1f1a] via-[#0d2b24] to-[#0a1f1a]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-[#00d4aa] animate-spin" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

