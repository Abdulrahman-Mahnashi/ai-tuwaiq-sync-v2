import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCog, Sparkles } from "lucide-react";
import { useLocalProjects } from "@/services/localProjects";

interface RolesTabProps {
  language: "en" | "ar";
}

type Language = "en" | "ar";

const ROLE_LIBRARY = [
  {
    keywords: ["python", "pandas", "tensorflow", "huggingface"],
    role: {
      ar: "مهندس تعلم الآلة",
      en: "Machine Learning Engineer",
    },
    tasks: {
      ar: ["بناء النماذج", "متابعة جودة البيانات", "اختبار الأداء"],
      en: ["Model building", "Data quality monitoring", "Performance testing"],
    },
  },
  {
    keywords: ["react", "next", "javascript", "typescript", "flutter", "dart"],
    role: {
      ar: "قائد تجربة المستخدم",
      en: "UX Engineering Lead",
    },
    tasks: {
      ar: ["تصميم الواجهات", "اختبار تجربة المستخدم", "إدارة رحلة المستخدم"],
      en: ["Design UI flows", "Run UX testing", "Own user journey"],
    },
  },
  {
    keywords: ["aws", "azure", "cloud", "mq", "mqtt"],
    role: {
      ar: "مهندس سحابي",
      en: "Cloud Architect",
    },
    tasks: {
      ar: ["إدارة البنية", "ضبط التكلفة", "تأمين البيانات"],
      en: ["Manage infrastructure", "Optimize cost", "Secure data"],
    },
  },
  {
    keywords: ["unity", "photon", "vr", "ar", "3d"],
    role: {
      ar: "قائد تجربة الواقع الممتد",
      en: "XR Experience Lead",
    },
    tasks: {
      ar: ["تجربة المستخدم ثلاثية الأبعاد", "اختبار الأجهزة", "إدارة المحتوى التفاعلي"],
      en: ["3D UX design", "Hardware testing", "Interactive content management"],
    },
  },
  {
    keywords: ["power bi", "dax", "sql", "analytics"],
    role: {
      ar: "محلل ذكاء الأعمال",
      en: "Business Intelligence Analyst",
    },
    tasks: {
      ar: ["نمذجة البيانات", "إعداد لوحات التحليلات", "تتبع مؤشرات الأداء"],
      en: ["Data modelling", "Build BI dashboards", "Track KPIs"],
    },
  },
];

const getRolesForProject = (technologies: string[], language: Language) => {
  if (!technologies?.length) return [];
  const techLower = technologies.map((tech) => tech.toLowerCase());
  const matches = ROLE_LIBRARY.filter((role) =>
    role.keywords.some((keyword) => techLower.includes(keyword)),
  );

  return matches.map((match) => ({
    title: match.role[language],
    tasks: match.tasks[language],
  }));
};

const RolesTab = ({ language }: RolesTabProps) => {
  const { projects, isLoading, error } = useLocalProjects();

  const translations = {
    ar: {
      title: "توزيع الأدوار",
      subtitle: "توزيع ذكي للأدوار بناءً على مهارات وتقنيات المشروع",
      loading: "جاري تحليل المهارات...",
      error: "تعذّر تحميل بيانات المشاريع. تأكد من وجود الملف projects-local.json.",
      noData: "أضف مشروعًا واحدًا على الأقل لتبدأ التوصيات.",
      highlight: "الأدوار المقترحة لهذا المشروع",
      tasks: "مسؤوليات أساسية",
      noRoles: "لم يتم التعرف على مهارات كافية. حاول إضافة تقنيات أكثر للمشروع.",
    },
    en: {
      title: "Role Assignment",
      subtitle: "Intelligent role recommendations based on project skills",
      loading: "Analysing team skillsets...",
      error: "Failed to load projects. Ensure projects-local.json exists.",
      noData: "Add at least one project to start generating recommendations.",
      highlight: "Recommended roles for this project",
      tasks: "Key responsibilities",
      noRoles: "Not enough skill signals detected. Consider adding more technologies.",
    },
  };

  const t = translations[language];

  const roleSuggestions = useMemo(() => {
    if (!projects?.length) return [];

    return projects.map((project) => ({
      projectTitle: project.title,
      bootcamp: project.bootcamp,
      roles: getRolesForProject(project.technologies, language),
    }));
  }, [projects, language]);

  if (isLoading) {
    return (
      <Card className="glass border border-white/10 p-12 text-center">
        <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse-glow" />
        <p className="text-muted-foreground">{t.loading}</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass border border-rose-500/30 p-8 text-center">
        <p className="text-red-300 font-semibold">{t.error}</p>
      </Card>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Card className="glass border border-white/10 p-8 text-center">
        <p className="text-muted-foreground">{t.noData}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold gradient-text">{t.title}</h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roleSuggestions.map((suggestion, index) => (
          <Card key={`${suggestion.projectTitle}-${index}`} className="glass border border-white/10 p-6 space-y-5 hover:border-emerald-400/30 transition-all">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-emerald-300/80">
                {language === "ar" ? "مشروع" : "Project"}
              </p>
              <h3 className="text-lg font-semibold text-emerald-100 leading-relaxed">
                {suggestion.projectTitle}
              </h3>
              <p className="text-xs text-muted-foreground">
                {language === "ar" ? "المعسكر" : "Bootcamp"}: {suggestion.bootcamp || "—"}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-emerald-100">{t.highlight}</p>
              {suggestion.roles.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t.noRoles}</p>
              ) : (
                suggestion.roles.map((role) => (
                  <div
                    key={role.title}
                    className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-100 text-xs px-3 py-1">
                        {role.title}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-emerald-100">
                        {t.tasks}
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc ms-4">
                        {role.tasks.map((task) => (
                          <li key={task}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RolesTab;
