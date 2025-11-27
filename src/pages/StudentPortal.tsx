import { useState } from "react";
import { GraduationCap, Bell, ArrowLeft, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import ProjectSubmissionForm from "@/components/ProjectSubmissionForm";
import NotificationsList from "@/components/NotificationsList";
import ErrorBoundary from "@/components/ErrorBoundary";

type Language = "en" | "ar";
type Tab = "submit" | "notifications";

const StudentPortal = () => {
  const [language, setLanguage] = useState<Language>("ar");
  const [activeTab, setActiveTab] = useState<Tab>("submit");
  const navigate = useNavigate();

  const isRTL = language === "ar";

  const translations = {
    ar: {
      title: "واجهة الطالب",
      submitTab: "تقديم مشروع التخرج",
      notificationsTab: "الإشعارات",
      backToHome: "العودة للصفحة الرئيسية",
    },
    en: {
      title: "Student Portal",
      submitTab: "Submit Graduation Project",
      notificationsTab: "Notifications",
      backToHome: "Back to Home",
    },
  };

  const t = translations[language];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen w-full text-foreground p-6 bg-gradient-to-br from-[#0a1f1a] via-[#0d2b24] to-[#0a1f1a]"
    >
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-[#00d4aa]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img
              src="https://i.ibb.co/3YdhZYz8/Smart-Code-Seamless-Solutions-1.png"
              alt="Tuwaiq Logo"
              className="h-12 w-auto"
            />
            <h1 className="text-3xl font-bold gradient-text">{t.title}</h1>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Tab Navigation */}
        <Card className="glass p-2 mb-6 neon-border">
          <nav className="flex gap-2 overflow-x-auto">
            {[
              { id: "submit", label: t.submitTab, icon: GraduationCap },
              { id: "notifications", label: t.notificationsTab, icon: Bell },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id ? "neon-glow" : ""
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </nav>
        </Card>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <div className="animate-in fade-in duration-500">
          {activeTab === "submit" && (
            <ErrorBoundary>
              <ProjectSubmissionForm language={language} />
            </ErrorBoundary>
          )}
          {activeTab === "notifications" && (
            <ErrorBoundary>
              <NotificationsList language={language} />
            </ErrorBoundary>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentPortal;

