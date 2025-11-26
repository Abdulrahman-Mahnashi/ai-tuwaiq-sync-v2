import { useState, useEffect } from "react";
import { UserCheck, FileText, BarChart3, ArrowLeft, Languages, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { getSubmittedProjects } from "@/services/projectService";
import SupervisorResponseDialog from "@/components/SupervisorResponseDialog";
import { MessageSquare, Users, Archive, Activity } from "lucide-react";
import { getNotifications } from "@/services/notificationService";
import { useLocalProjects } from "@/services/localProjects";

type Language = "en" | "ar";
type Tab = "active_projects" | "past_projects" | "reports" | "analytics";

const SupervisorPortal = () => {
  const [language, setLanguage] = useState<Language>("ar");
  const [activeTab, setActiveTab] = useState<Tab>("active_projects");
  const [submittedProjects, setSubmittedProjects] = useState(getSubmittedProjects());
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mergeNotifications, setMergeNotifications] = useState<Array<any>>([]);
  const { projects: pastProjects, isLoading: isLoadingPastProjects } = useLocalProjects();

  // Refresh projects and notifications when tab changes or user changes
  useEffect(() => {
    setSubmittedProjects(getSubmittedProjects());
    if (user?.id) {
      const notifications = getNotifications(user.id);
      setMergeNotifications(notifications.filter(n => 
        n.title?.includes("فرصة دمج") || 
        n.title?.includes("Merge Opportunity") ||
        n.message?.includes("معسكرين مختلفين") ||
        n.message?.includes("different bootcamps")
      ));
    } else {
      setMergeNotifications([]);
    }
  }, [activeTab, user]);

  // Redirect if not supervisor
  useEffect(() => {
    if (user && user.role !== "supervisor") {
      navigate("/student", { replace: true });
    }
  }, [user, navigate]);

  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1f1a] via-[#0d2b24] to-[#0a1f1a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (user.role !== "supervisor") {
    return null;
  }

  const isRTL = language === "ar";

  const translations = {
    ar: {
      title: "واجهة المشرف",
      activeProjectsTab: "المشاريع النشطة",
      pastProjectsTab: "المشاريع السابقة",
      reportsTab: "تقارير التشابه",
      analyticsTab: "التحليلات",
      backToHome: "العودة للصفحة الرئيسية",
      totalProjects: "إجمالي المشاريع",
      pendingReview: "قيد المراجعة",
      highSimilarity: "تشابه عالي",
      approved: "موافق عليها",
      noActiveProjects: "لا توجد مشاريع نشطة حالياً",
      noPastProjects: "لا توجد مشاريع سابقة",
      loadingProjects: "جاري تحميل المشاريع...",
      projectTitle: "عنوان المشروع",
      teamMembers: "أعضاء الفريق",
      bootcamp: "المعسكر",
      supervisor: "المشرف",
      description: "الوصف",
      technologies: "التقنيات",
      status: "الحالة",
      submittedDate: "تاريخ التقديم",
    },
    en: {
      title: "Supervisor Portal",
      activeProjectsTab: "Active Projects",
      pastProjectsTab: "Past Projects",
      reportsTab: "Similarity Reports",
      analyticsTab: "Analytics",
      backToHome: "Back to Home",
      totalProjects: "Total Projects",
      pendingReview: "Pending Review",
      highSimilarity: "High Similarity",
      approved: "Approved",
      noActiveProjects: "No active projects at the moment",
      noPastProjects: "No past projects",
      loadingProjects: "Loading projects...",
      projectTitle: "Project Title",
      teamMembers: "Team Members",
      bootcamp: "Bootcamp",
      supervisor: "Supervisor",
      description: "Description",
      technologies: "Technologies",
      status: "Status",
      submittedDate: "Submitted Date",
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
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-red-400"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {language === "ar" ? "تسجيل الخروج" : "Logout"}
              </Button>
            )}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass p-4 neon-border">
            <div className="text-sm text-muted-foreground mb-1">{t.totalProjects}</div>
            <div className="text-2xl font-bold text-emerald-300">
              {submittedProjects.length + pastProjects.length}
            </div>
          </Card>
          <Card className="glass p-4 neon-border">
            <div className="text-sm text-muted-foreground mb-1">{t.activeProjectsTab}</div>
            <div className="text-2xl font-bold text-amber-300">{submittedProjects.length}</div>
          </Card>
          <Card className="glass p-4 neon-border">
            <div className="text-sm text-muted-foreground mb-1">{t.pastProjectsTab}</div>
            <div className="text-2xl font-bold text-cyan-300">{pastProjects.length}</div>
          </Card>
          <Card className="glass p-4 neon-border">
            <div className="text-sm text-muted-foreground mb-1">{t.highSimilarity}</div>
            <div className="text-2xl font-bold text-red-300">
              {submittedProjects.filter(p => 
                p.similarity_alerts && p.similarity_alerts.some((a: any) => a.similarity_score >= 0.7)
              ).length}
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Card className="glass p-2 mb-6 neon-border">
          <nav className="flex gap-2 overflow-x-auto">
            {[
              { id: "active_projects", label: t.activeProjectsTab, icon: Activity },
              { id: "past_projects", label: t.pastProjectsTab, icon: Archive },
              { id: "reports", label: t.reportsTab, icon: BarChart3 },
              { id: "analytics", label: t.analyticsTab, icon: BarChart3 },
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
          {/* Active Projects Tab */}
          {activeTab === "active_projects" && (
            <Card className="glass p-8 neon-border">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="h-6 w-6 text-emerald-400" />
                <h2 className="text-2xl font-bold">{t.activeProjectsTab}</h2>
                <Badge variant="secondary" className="ml-auto">
                  {submittedProjects.length} {language === "ar" ? "مشروع" : "projects"}
                </Badge>
              </div>
              {submittedProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t.noActiveProjects}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submittedProjects.map((project) => (
                    <Card key={project.id} className="p-6 border border-white/10 hover:border-emerald-400/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-emerald-100 mb-2">{project.project_name}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {project.project_description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          {project.similarity_alerts && project.similarity_alerts.length > 0 && (
                            <Badge variant="destructive" className="w-fit">
                              {Math.round(project.similarity_alerts[0].similarity_score * 100)}% {language === "ar" ? "تشابه" : "Similarity"}
                            </Badge>
                          )}
                          <Badge variant={
                            project.status === "approved" ? "default" :
                            project.status === "pending_review" ? "secondary" :
                            project.status === "needs_revision" ? "destructive" : "outline"
                          } className="w-fit">
                            {project.status === "pending_review" ? (language === "ar" ? "قيد المراجعة" : "Pending Review") :
                             project.status === "approved" ? (language === "ar" ? "موافق" : "Approved") :
                             project.status === "needs_revision" ? (language === "ar" ? "يحتاج مراجعة" : "Needs Revision") :
                             project.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t.teamMembers}:</span>
                          <span className="ml-2 text-foreground">{project.team.map(t => t.full_name).join(", ")}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t.bootcamp}:</span>
                          <span className="ml-2 text-foreground">{project.bootcamp_name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t.supervisor}:</span>
                          <span className="ml-2 text-foreground">{project.bootcamp_supervisor}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t.technologies}:</span>
                          <span className="ml-2 text-foreground">{project.tools_technologies.join(", ")}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-white/10">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedProject(project.id);
                            setResponseDialogOpen(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {language === "ar" ? "رد على الفريق" : "Respond to Team"}
                        </Button>
                        <Button size="sm" variant="outline">
                          {language === "ar" ? "عرض التفاصيل" : "View Details"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Past Projects Tab */}
          {activeTab === "past_projects" && (
            <Card className="glass p-8 neon-border">
              <div className="flex items-center gap-3 mb-6">
                <Archive className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-bold">{t.pastProjectsTab}</h2>
                <Badge variant="secondary" className="ml-auto">
                  {pastProjects.length} {language === "ar" ? "مشروع" : "projects"}
                </Badge>
              </div>
              {isLoadingPastProjects ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">{t.loadingProjects}</p>
                </div>
              ) : pastProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t.noPastProjects}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastProjects.map((project) => (
                    <Card key={project.id} className="p-6 border border-white/10 hover:border-cyan-400/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-cyan-100 mb-2">{project.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {project.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          {project.status === "completed" ? (language === "ar" ? "مكتمل" : "Completed") :
                           project.status === "pending" ? (language === "ar" ? "قيد التنفيذ" : "In Progress") :
                           language === "ar" ? "مكتمل" : "Completed"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {project.bootcamp && (
                          <div>
                            <span className="text-muted-foreground">{t.bootcamp}:</span>
                            <span className="ml-2 text-foreground">{project.bootcamp}</span>
                          </div>
                        )}
                        {project.team_members && project.team_members.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">{t.teamMembers}:</span>
                            <span className="ml-2 text-foreground">{project.team_members.join(", ")}</span>
                          </div>
                        )}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground">{t.technologies}:</span>
                            <span className="ml-2 text-foreground">{project.technologies.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          )}
          {activeTab === "reports" && (
            <Card className="glass p-8 neon-border">
              <h2 className="text-2xl font-bold mb-4">{t.reportsTab}</h2>
              
              {/* Merge Opportunities Section */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-400" />
                  {language === "ar" ? "فرص دمج الفرق" : "Team Merge Opportunities"}
                </h3>
                
                {mergeNotifications.length === 0 ? (
                  <p className="text-muted-foreground">
                    {language === "ar"
                      ? "لا توجد فرص دمج حالياً"
                      : "No merge opportunities at the moment"}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {mergeNotifications.map((notification) => (
                      <Card key={notification.id} className="p-4 border border-cyan-400/30 bg-cyan-500/5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-cyan-100 mb-2">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{notification.message}</p>
                            {notification.metadata?.similarity_score && (
                              <div className="mt-2 text-xs text-cyan-300">
                                {language === "ar" ? "درجة التشابه:" : "Similarity:"}{" "}
                                {(notification.metadata.similarity_score * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/10">
                            {language === "ar" ? "عرض التفاصيل" : "View Details"}
                          </Button>
                          <Button size="sm" variant="outline" className="border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/10">
                            {language === "ar" ? "اقتراح الدمج" : "Suggest Merge"}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Similarity Reports */}
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  {language === "ar" ? "تقارير التشابه" : "Similarity Reports"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "ar"
                    ? "تقارير التشابه التفصيلية ستظهر هنا"
                    : "Detailed similarity reports will appear here"}
                </p>
              </div>
            </Card>
          )}
          {activeTab === "analytics" && (
            <Card className="glass p-8 neon-border">
              <h2 className="text-2xl font-bold mb-4">{t.analyticsTab}</h2>
              <p className="text-muted-foreground">
                {language === "ar"
                  ? "التحليلات والإحصائيات ستظهر هنا"
                  : "Analytics and statistics will appear here"}
              </p>
            </Card>
          )}
        </div>
      </main>

      {/* Supervisor Response Dialog */}
      {selectedProject && (
        <SupervisorResponseDialog
          project={submittedProjects.find((p) => p.id === selectedProject)!}
          open={responseDialogOpen}
          onOpenChange={(open) => {
            setResponseDialogOpen(open);
            if (!open) {
              setSelectedProject(null);
              // Refresh projects after response
              setSubmittedProjects(getSubmittedProjects());
            }
          }}
          language={language}
        />
      )}
    </div>
  );
};

export default SupervisorPortal;

