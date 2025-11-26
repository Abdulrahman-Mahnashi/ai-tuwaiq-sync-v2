import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, UserCheck, Languages, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // If user is logged in, redirect to their portal automatically
    if (user) {
      if (user.role === "student") {
        navigate("/student", { replace: true });
      } else {
        navigate("/supervisor", { replace: true });
      }
    } else {
      // If not logged in, redirect to login page automatically
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Show loading or nothing while redirecting
  if (isLoading || user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a1f1a] via-[#0d2b24] to-[#0a1f1a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التوجيه...</p>
        </div>
      </div>
    );
  }

  const isRTL = language === "ar";

  const translations = {
    ar: {
      title: "طويق بروجيكت سنك",
      subtitle: "منصة إدارة مشاريع التخرج الذكية",
      studentButton: "واجهة الطالب",
      studentDesc: "تقديم مشروع التخرج ومتابعة الإشعارات",
      supervisorButton: "واجهة المشرف",
      supervisorDesc: "مراجعة المشاريع وإدارة التقارير",
    },
    en: {
      title: "Tuwaiq Project Sync",
      subtitle: "Intelligent Graduation Project Management Platform",
      studentButton: "Student Portal",
      studentDesc: "Submit graduation project and view notifications",
      supervisorButton: "Supervisor Portal",
      supervisorDesc: "Review projects and manage reports",
    },
  };

  const t = translations[language];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-[#0a1f1a] via-[#0d2b24] to-[#0a1f1a]"
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img
              src="https://i.ibb.co/3YdhZYz8/Smart-Code-Seamless-Solutions-1.png"
              alt="Tuwaiq Logo"
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-[#00d4aa] to-[#00ff88] bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Portal Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Student Portal Card */}
          <Card className="glass p-8 neon-border hover:border-emerald-400/50 transition-all cursor-pointer group">
            <div
              onClick={() => navigate("/student")}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="p-6 rounded-full bg-gradient-to-br from-emerald-500/25 via-emerald-400/20 to-transparent border border-emerald-400/30 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-16 w-16 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-emerald-100">
                  {t.studentButton}
                </h2>
                <p className="text-muted-foreground">{t.studentDesc}</p>
              </div>
              <Button
                size="lg"
                onClick={() => navigate("/login?role=student")}
                className="w-full neon-glow bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-emerald-950 font-bold"
              >
                <LogIn className="mr-2 h-5 w-5" />
                {t.studentButton}
              </Button>
            </div>
          </Card>

          {/* Supervisor Portal Card */}
          <Card className="glass p-8 neon-border hover:border-cyan-400/50 transition-all cursor-pointer group">
            <div
              onClick={() => navigate("/supervisor")}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="p-6 rounded-full bg-gradient-to-br from-cyan-500/25 via-cyan-400/20 to-transparent border border-cyan-400/30 group-hover:scale-110 transition-transform">
                <UserCheck className="h-16 w-16 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-cyan-100">
                  {t.supervisorButton}
                </h2>
                <p className="text-muted-foreground">{t.supervisorDesc}</p>
              </div>
              <Button
                size="lg"
                onClick={() => navigate("/login?role=supervisor")}
                className="w-full neon-glow bg-gradient-to-r from-cyan-500 to-blue-400 hover:from-cyan-400 hover:to-blue-300 text-cyan-950 font-bold"
              >
                <LogIn className="mr-2 h-5 w-5" />
                {t.supervisorButton}
              </Button>
            </div>
          </Card>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="text-muted-foreground hover:text-[#00d4aa]"
          >
            <Languages className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;

