import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Loader2, Code, Users, GraduationCap } from "lucide-react";
import { useLocalProjects } from "@/services/localProjects";

interface ProjectsTabProps {
  language: "en" | "ar";
}

const ProjectsTab = ({ language }: ProjectsTabProps) => {
  const { projects, isLoading, error } = useLocalProjects();

  const translations = {
    ar: {
      title: "لوحة المشاريع",
      subtitle: "المشاريع التي تم تجميعها من دفعات معسكرات طويق",
      noData: "لا توجد مشاريع في المكتبة المحلية بعد",
      bootcamp: "البرنامج",
      projects: "مشروع",
      loading: "جاري التحميل...",
      technologies: "التقنيات",
      team: "الفريق",
      error: "تعذّر تحميل المشاريع",
    },
    en: {
      title: "Projects Dashboard",
      subtitle: "Projects aggregated from Tuwaiq bootcamps",
      noData: "No projects in the local library yet",
      bootcamp: "Bootcamp",
      projects: "projects",
      loading: "Loading...",
      technologies: "Technologies",
      team: "Team",
      error: "Failed to load projects",
    },
  };

  const t = translations[language];

  if (error) {
    return (
      <Card className="glass p-12 neon-border text-center">
        <FolderOpen className="h-24 w-24 mx-auto mb-4 text-red-500 opacity-70" />
        <h3 className="text-xl font-semibold mb-2">
          {language === "ar" ? "تعذّر تحميل المشاريع" : t.error}
        </h3>
        <p className="text-muted-foreground text-sm">
          {language === "ar"
            ? "تأكد من أن الملف projects-local.json موجود داخل public/data/"
            : "Make sure projects-local.json exists inside public/data/."}
        </p>
        <p className="text-xs text-muted-foreground mt-4 break-all">
          {error}
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="glass p-12 neon-border text-center">
        <Loader2 className="h-24 w-24 mx-auto mb-4 text-primary animate-spin" />
        <h3 className="text-xl font-semibold mb-2">{t.loading}</h3>
      </Card>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Card className="glass p-12 neon-border text-center">
        <FolderOpen className="h-24 w-24 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-semibold mb-2">{t.noData}</h3>
        <p className="text-muted-foreground">
          {language === "ar"
            ? "قم بتوليد الملف projects-local.json باستخدام سكربت الدمج أو ضع ملفاتك في مجلد public/data/"
            : "Generate projects-local.json using the combine script or place your files inside public/data/"}
        </p>
      </Card>
    );
  }

  // Group projects by bootcamp
  const groupedProjects = projects.reduce((acc: any, project: any) => {
    const bootcamp = project.bootcamp || (language === "ar" ? "غير محدد" : "Unknown");
    if (!acc[bootcamp]) {
      acc[bootcamp] = [];
    }
    acc[bootcamp].push(project);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 gradient-text">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {Object.entries(groupedProjects).map(([bootcamp, bootcampProjects]: [string, any]) => (
        <Card key={bootcamp} className="glass p-6 border border-white/5 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold text-emerald-200">{bootcamp}</h3>
            </div>
            <Badge variant="secondary" className="text-sm md:text-base px-4 py-2 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-400/30">
              {bootcampProjects.length} {t.projects}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bootcampProjects.map((project: any, idx: number) => (
              <Card key={project.id || idx} className="p-5 bg-card/60 border border-white/5 rounded-2xl hover:border-emerald-400/40 transition-all">
                <h4 className="font-semibold mb-3 text-foreground text-lg leading-relaxed line-clamp-2">
                  {project.title || `Project ${idx + 1}`}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-4 mb-4 leading-relaxed">
                  {project.description || (language === "ar" ? "لا يوجد وصف" : "No description available")}
                </p>
                
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex items-start gap-3 mb-3">
                    <Code className="h-4 w-4 text-accent mt-1" />
                    <div className="flex flex-wrap gap-2 flex-1">
                      {project.technologies.slice(0, 3).map((tech: string, techIdx: number) => (
                        <Badge key={techIdx} variant="outline" className="text-xs rounded-full border-emerald-400/40 text-emerald-100 bg-emerald-500/5">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs rounded-full border-emerald-400/30 text-emerald-100 bg-emerald-500/5">
                          +{project.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {project.team_members && project.team_members.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      <span>
                        {project.team_members.length} {t.team}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.team_members.slice(0, 4).map((member: string, memberIdx: number) => (
                        <Badge
                          key={memberIdx}
                          variant="secondary"
                          className="bg-white/5 border border-white/10 text-[11px] rounded-full px-3 py-1"
                        >
                          {member}
                        </Badge>
                      ))}
                      {project.team_members.length > 4 && (
                        <Badge
                          variant="secondary"
                          className="bg-white/5 border border-white/10 text-[11px] rounded-full px-3 py-1"
                        >
                          +{project.team_members.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProjectsTab;
