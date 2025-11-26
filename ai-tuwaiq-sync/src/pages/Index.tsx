import { useState } from "react";
import { Brain, Users, UserCog, Lightbulb, Languages, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AgentCard from "@/components/AgentCard";
import IdeaInput from "@/components/IdeaInput";
import ProjectsTab from "@/components/ProjectsTab";
import CollaborationTab from "@/components/CollaborationTab";
import RolesTab from "@/components/RolesTab";
import ReportsTab from "@/components/ReportsTab";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Language = "en" | "ar";
type Tab = "idea" | "projects" | "collaboration" | "roles" | "reports";

const Index = () => {
  const [language, setLanguage] = useState<Language>("ar");
  const [activeTab, setActiveTab] = useState<Tab>("idea");
  const { user, logout } = useAuth();

  const isRTL = language === "ar";

  const translations = {
    ar: {
      title: "طويق بروجيكت سنك",
      subtitle: "منصة تحليل مشاريع طويق التي توحّد المعرفة وتمنع التكرار",
      tagline: "ذكاء اصطناعي صُمّم لتمكين فرق طويق من مشاركة التعلم وتسريع الابتكار.",
      ideaTab: "تحليل الفكرة",
      projectsTab: "المشاريع",
      collaborationTab: "التعاون",
      rolesTab: "الأدوار",
      reportsTab: "التقارير",
      agent1Title: "وكيل التحليل",
      agent1Desc: "يحلل التشابه بين المشاريع الحالية والسابقة",
      agent2Title: "وكيل التعاون",
      agent2Desc: "يقترح خطط التعاون بين الفرق",
      agent3Title: "وكيل توزيع الأدوار",
      agent3Desc: "يوزع الأدوار بناءً على المهارات",
    },
    en: {
      title: "Tuwaiq Project Sync",
      subtitle: "An intelligent hub that unifies Tuwaiq Academy knowledge and prevents duplication",
      tagline: "AI insights designed to help Tuwaiq teams share learnings and accelerate innovation.",
      ideaTab: "Analyze Idea",
      projectsTab: "Projects",
      collaborationTab: "Collaboration",
      rolesTab: "Roles",
      reportsTab: "Reports",
      agent1Title: "Analyzer Agent",
      agent1Desc: "Analyzes similarity between current and past projects",
      agent2Title: "Collaboration Agent",
      agent2Desc: "Proposes collaboration plans between teams",
      agent3Title: "Role Assignment Agent",
      agent3Desc: "Distributes roles based on skill sets",
    },
  };

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ar" ? "en" : "ar"));
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen w-full text-foreground p-6"
    >
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col gap-10 rounded-3xl border border-white/5 p-6 md:p-10 glass">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src="https://i.ibb.co/3YdhZYz8/Smart-Code-Seamless-Solutions-1.png"
                alt="Tuwaiq Project Sync logo"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight gradient-text">
                  {t.title}
                </h1>
                <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl">
                  {t.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user?.name || user?.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass neon-border">
                  <DropdownMenuLabel>
                    {language === "ar" ? "حسابي" : "My Account"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {language === "ar" ? "تسجيل الخروج" : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleLanguage}
                className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Languages className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
            {t.tagline}
          </div>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="default"
              className="px-6 py-6 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-emerald-950 font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
              onClick={() => setActiveTab("idea")}
            >
              {language === "ar" ? "ابدأ بتحليل فكرة" : "Start Analyzing an Idea"}
            </Button>
            <Button
              variant="outline"
              className="px-6 py-6 rounded-full border-emerald-400/60 text-emerald-100 hover:bg-emerald-500/10"
              onClick={() => setActiveTab("projects")}
            >
              {language === "ar" ? "استكشف قاعدة المشاريع" : "Browse Project Library"}
            </Button>
          </div>
        </div>

        {/* AI Agents Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AgentCard
            icon={Brain}
            title={t.agent1Title}
            description={t.agent1Desc}
            color="emerald"
            delay={0}
          />
          <AgentCard
            icon={Users}
            title={t.agent2Title}
            description={t.agent2Desc}
            color="teal"
            delay={0.1}
          />
          <AgentCard
            icon={UserCog}
            title={t.agent3Title}
            description={t.agent3Desc}
            color="amber"
            delay={0.2}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <Card className="glass p-2 mb-6 neon-border">
          <nav className="flex gap-2 overflow-x-auto">
            {[
              { id: "idea", label: t.ideaTab, icon: Lightbulb },
              { id: "projects", label: t.projectsTab, icon: Brain },
              { id: "collaboration", label: t.collaborationTab, icon: Users },
              { id: "roles", label: t.rolesTab, icon: UserCog },
              { id: "reports", label: t.reportsTab, icon: Brain },
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

        {/* Tab Content */}
        <div className="animate-in fade-in duration-500">
          {activeTab === "idea" && (
            <IdeaInput language={language} />
          )}
          {activeTab === "projects" && (
            <ProjectsTab language={language} />
          )}
          {activeTab === "collaboration" && (
            <CollaborationTab language={language} />
          )}
          {activeTab === "roles" && <RolesTab language={language} />}
          {activeTab === "reports" && <ReportsTab language={language} />}
        </div>
      </main>

      {/* Floating AI Chat Button */}
      <Button
        size="lg"
        className="fixed bottom-6 left-6 rounded-full w-16 h-16 neon-glow animate-pulse-glow shadow-2xl z-50"
      >
        <Brain className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Index;
