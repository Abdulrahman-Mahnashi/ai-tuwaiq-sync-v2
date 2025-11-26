import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Code, GraduationCap, TrendingUp } from "lucide-react";

interface SimilarProject {
  id: string;
  title: string;
  description: string;
  bootcamp: string | null;
  technologies: string[] | null;
  team_members: string[] | null;
  similarity_score: number;
}

interface SimilarProjectsProps {
  language: "en" | "ar";
  projects: SimilarProject[];
  inputIdea: string;
}

const SimilarProjects = ({ language, projects, inputIdea }: SimilarProjectsProps) => {
  const translations = {
    ar: {
      title: "المشاريع المشابهة",
      subtitle: "المشاريع الموجودة في قاعدة البيانات التي تشبه فكرتك",
      noProjects: "لم يتم العثور على مشاريع مشابهة",
      similarity: "معدل التشابه",
      technologies: "التقنيات",
      team: "الفريق",
      bootcamp: "البرنامج",
      score: "نقاط",
    },
    en: {
      title: "Similar Projects",
      subtitle: "Existing projects in the database that are similar to your idea",
      noProjects: "No similar projects found",
      similarity: "Similarity",
      technologies: "Technologies",
      team: "Team",
      bootcamp: "Bootcamp",
      score: "score",
    },
  };

  const t = translations[language];

  if (projects.length === 0) {
    return (
      <Card className="glass p-12 neon-border text-center">
        <Sparkles className="h-24 w-24 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-semibold mb-2">{t.noProjects}</h3>
        <p className="text-muted-foreground">
          {language === "ar"
            ? "يمكنك إنشاء مشروع جديد بناءً على فكرتك!"
            : "You can create a new project based on your idea!"}
        </p>
      </Card>
    );
  }

  const getSimilarityColor = (score: number) => {
    if (score > 0.7) return "text-green-500";
    if (score > 0.5) return "text-yellow-500";
    return "text-orange-500";
  };

  const getSimilarityPercentage = (score: number) => {
    return Math.round(score * 100);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 gradient-text">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="glass p-6 neon-border hover:neon-glow transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-primary flex-1">
                {project.title}
              </h3>
              <div className="flex items-center gap-2 ml-4">
                <TrendingUp
                  className={`h-5 w-5 ${getSimilarityColor(project.similarity_score)}`}
                />
                <span
                  className={`font-bold ${getSimilarityColor(project.similarity_score)}`}
                >
                  {getSimilarityPercentage(project.similarity_score)}%
                </span>
              </div>
            </div>

            <p className="text-muted-foreground mb-4 line-clamp-3">
              {project.description}
            </p>

            <div className="space-y-3">
              {project.bootcamp && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-secondary" />
                  <Badge variant="secondary">{project.bootcamp}</Badge>
                </div>
              )}

              {project.technologies && project.technologies.length > 0 && (
                <div className="flex items-start gap-2">
                  <Code className="h-4 w-4 text-accent mt-1" />
                  <div className="flex flex-wrap gap-2 flex-1">
                    {project.technologies.slice(0, 5).map((tech, idx) => (
                      <Badge key={idx} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {project.team_members && project.team_members.length > 0 && (
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-primary mt-1" />
                  <div className="flex flex-wrap gap-2 flex-1">
                    {project.team_members.slice(0, 3).map((member, idx) => (
                      <Badge key={idx} variant="secondary">
                        {member}
                      </Badge>
                    ))}
                    {project.team_members.length > 3 && (
                      <Badge variant="secondary">
                        +{project.team_members.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.similarity}:</span>
                <span className={`font-semibold ${getSimilarityColor(project.similarity_score)}`}>
                  {getSimilarityPercentage(project.similarity_score)}% {t.score}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SimilarProjects;

