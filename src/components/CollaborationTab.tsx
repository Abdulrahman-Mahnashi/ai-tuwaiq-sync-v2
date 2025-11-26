import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Link2, Users } from "lucide-react";
import { useLocalProjects } from "@/services/localProjects";

interface CollaborationTabProps {
  language: "en" | "ar";
}

interface CollaborationSuggestion {
  projects: [string, string];
  sharedTechnologies: string[];
  bootcamps: [string | null, string | null];
  insightAr: string;
  insightEn: string;
}

const technologyWeight = (tech: string) => {
  const key = tech.toLowerCase();
  if (key.includes("ai") || key.includes("machine") || key.includes("learning")) return 3;
  if (key.includes("cloud") || key.includes("aws") || key.includes("azure")) return 2;
  return 1;
};

const buildSuggestion = (
  projectA: { title: string; technologies: string[]; bootcamp: string | null },
  projectB: { title: string; technologies: string[]; bootcamp: string | null },
): CollaborationSuggestion | null => {
  const techA = projectA.technologies?.map((t) => t.toLowerCase());
  const techB = projectB.technologies?.map((t) => t.toLowerCase());
  if (!techA?.length || !techB?.length) return null;

  const shared = Array.from(new Set(techA.filter((t) => techB.includes(t))));
  if (shared.length === 0) return null;

  const capitalised = shared.map(
    (tech) => tech.charAt(0).toUpperCase() + tech.slice(1),
  );

  return {
    projects: [projectA.title, projectB.title],
    sharedTechnologies: capitalised,
    bootcamps: [projectA.bootcamp, projectB.bootcamp],
    insightAr: `يمكن دمج خبرات الفريقين عبر ${capitalised.join("، ")} لتسريع بناء حلول مشتركة.`,
    insightEn: `Combine both teams' expertise in ${capitalised.join(", ")} to accelerate a joint solution.`,
  };
};

const CollaborationTab = ({ language }: CollaborationTabProps) => {
  const { projects, isLoading, error } = useLocalProjects();

  const translations = {
    ar: {
      title: "خطط التعاون",
      subtitle: "اقتراحات التعاون الذكية بين الفرق",
      loading: "جاري تحليل المشاريع...",
      error: "تعذّر تحميل بيانات المشاريع. تأكد من وجود الملف projects-local.json.",
      noData: "لم يتم العثور على بيانات مشاريع بعد.",
      empty: "لم نجد مشاريع متشابهه بما يكفي، جرّب إضافة ملفات أكثر تنوعاً.",
      sharedTech: "تقنيات مشتركة",
      recommended: "لماذا نوصي بهذا التعاون؟",
      bootcamp: "المعسكر",
    },
    en: {
      title: "Collaboration Plans",
      subtitle: "AI-powered collaboration ideas for Tuwaiq teams",
      loading: "Analysing projects...",
      error: "Failed to load projects. Make sure projects-local.json exists.",
      noData: "No project data found yet.",
      empty: "Not enough overlapping technologies yet. Try adding more files.",
      sharedTech: "Shared Technologies",
      recommended: "Why this collaboration works",
      bootcamp: "Bootcamp",
    },
  };

  const t = translations[language];

  const suggestions = useMemo(() => {
    if (!projects?.length) return [];
    const results: CollaborationSuggestion[] = [];

    for (let i = 0; i < projects.length; i += 1) {
      for (let j = i + 1; j < projects.length; j += 1) {
        const suggestion = buildSuggestion(projects[i], projects[j]);
        if (suggestion) {
          results.push(suggestion);
        }
      }
    }

    return results
      .sort((a, b) => {
        const scoreA = a.sharedTechnologies.reduce((acc, tech) => acc + technologyWeight(tech), 0);
        const scoreB = b.sharedTechnologies.reduce((acc, tech) => acc + technologyWeight(tech), 0);
        return scoreB - scoreA;
      })
      .slice(0, 4);
  }, [projects]);

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

      {suggestions.length === 0 ? (
        <Card className="glass border border-white/10 p-10 text-center space-y-4">
          <Users className="h-12 w-12 mx-auto text-primary animate-pulse-glow" />
          <p className="text-muted-foreground">{t.empty}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((suggestion, index) => (
            <Card key={`${suggestion.projects.join("-")}-${index}`} className="glass border border-white/10 p-6 space-y-4 hover:border-emerald-400/30 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-emerald-300/80 mb-1">
                    {language === "ar" ? "فرصة تعاون" : "Collaboration Opportunity"}
                  </p>
                  <h3 className="text-lg font-semibold text-emerald-100 leading-relaxed">
                    {suggestion.projects[0]}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "ar" ? t.bootcamp : `${t.bootcamp}:`} {suggestion.bootcamps[0] || "—"}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <Link2 className="h-7 w-7 text-emerald-300" />
                </div>
              </div>

              <div className="border border-white/5 rounded-xl bg-white/3 p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {suggestion.sharedTechnologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="bg-emerald-500/10 border border-emerald-400/30 text-emerald-100 text-xs rounded-full px-3 py-1"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {language === "ar" ? suggestion.insightAr : suggestion.insightEn}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-emerald-100 mb-2">
                  {language === "ar" ? "الفريق المقترح" : "Suggested Partner Team"}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {suggestion.projects[1]}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "ar" ? t.bootcamp : `${t.bootcamp}:`} {suggestion.bootcamps[1] || "—"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollaborationTab;
