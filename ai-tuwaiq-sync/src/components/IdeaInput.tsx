import { useState } from "react";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SimilarProjects from "./SimilarProjects";
import { useLocalProjects } from "@/services/localProjects";

interface IdeaInputProps {
  language: "en" | "ar";
}

interface SimilarProject {
  id: string;
  title: string;
  description: string;
  bootcamp: string | null;
  technologies: string[] | null;
  team_members: string[] | null;
  similarity_score: number;
}

const IdeaInput = ({ language }: IdeaInputProps) => {
  const [idea, setIdea] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [similarProjects, setSimilarProjects] = useState<SimilarProject[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();
  const {
    projects: localProjects,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useLocalProjects();

  const translations = {
    ar: {
      title: "تحليل الفكرة الذكي",
      subtitle: "اكتب فكرة مشروعك وسيقوم الـ Agent بمقارنتها بالمشاريع الموجودة في قاعدة البيانات",
      placeholder: "مثال: أريد إنشاء تطبيق للتعلم الإلكتروني باستخدام React و Node.js...",
      analyzeButton: "تحليل الفكرة",
      analyzing: "جاري التحليل...",
      success: "تم التحليل بنجاح!",
      error: "حدث خطأ أثناء التحليل",
      noIdea: "يرجى إدخال فكرة المشروع",
      noSimilarProjects: "لم يتم العثور على مشاريع مشابهة",
      foundSimilar: "تم العثور على مشاريع مشابهة",
    },
    en: {
      title: "Smart Idea Analysis",
      subtitle: "Write your project idea and the Agent will compare it with existing projects in the database",
      placeholder: "Example: I want to create an e-learning app using React and Node.js...",
      analyzeButton: "Analyze Idea",
      analyzing: "Analyzing...",
      success: "Analysis completed successfully!",
      error: "An error occurred during analysis",
      noIdea: "Please enter a project idea",
      noSimilarProjects: "No similar projects found",
      foundSimilar: "Similar projects found",
    },
  };

  const t = translations[language];

  // Simple text similarity calculation (can be enhanced with AI/ML later)
  const calculateSimilarity = (text1: string, text2: string): number => {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  };

  const handleAnalyze = async () => {
    if (!idea.trim()) {
      toast({
        title: t.error,
        description: t.noIdea,
        variant: "destructive",
      });
      return;
    }

    if (isLoadingProjects) {
      toast({
        title: t.error,
        description:
          language === "ar"
            ? "الرجاء الانتظار حتى تحميل بيانات المشاريع"
            : "Please wait for the projects to finish loading",
      });
      return;
    }

    if (projectsError) {
      toast({
        title: t.error,
        description: projectsError,
        variant: "destructive",
      });
      return;
    }

    if (!localProjects || localProjects.length === 0) {
      toast({
        title: t.noSimilarProjects,
        description:
          language === "ar"
            ? "لا توجد مشاريع في البيانات المحلية. تأكد من إنشاء ملف projects-local.json."
            : "No projects found in local data. Please make sure projects-local.json exists.",
      });
      return;
    }

    setIsAnalyzing(true);
    setHasSearched(true);
    setSimilarProjects([]);

    try {
      // Calculate similarity for each project
      const projectsWithSimilarity = localProjects.map((project) => {
        const projectText = `${project.title || ""} ${project.description || ""} ${project.bootcamp || ""} ${(project.technologies || []).join(" ")}`;
        const similarity = calculateSimilarity(idea, projectText);
        
        return {
          ...project,
          similarity_score: similarity,
        };
      });

      // Filter and sort by similarity (threshold: 0.1 = 10%)
      const similar = projectsWithSimilarity
        .filter((p) => p.similarity_score > 0.1)
        .sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))
        .slice(0, 5) as SimilarProject[];

      setSimilarProjects(similar);

      // Store the search result in database
      toast({
        title: similar.length > 0 ? t.success : t.noSimilarProjects,
        description:
          similar.length > 0
            ? `${similar.length} ${t.foundSimilar}`
            : language === "ar"
              ? "لم يتم العثور على مشاريع مشابهة. تأكد من أن ملفاتك تحتوي على بيانات ذات صلة."
              : "No similar projects found. Make sure your files contain relevant data.",
        variant: similar.length > 0 ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error analyzing idea:", error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass p-8 neon-border">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold mb-2 gradient-text">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder={t.placeholder}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="min-h-[200px] glass border-primary/50 resize-none"
            disabled={isAnalyzing}
          />

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !idea.trim()}
            className="w-full neon-glow"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t.analyzing}
              </>
            ) : (
              <>
                <Brain className="mr-2 h-5 w-5" />
                {t.analyzeButton}
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Similar Projects Results */}
      {hasSearched && (
        <SimilarProjects
          language={language}
          projects={similarProjects}
          inputIdea={idea}
        />
      )}
    </div>
  );
};

export default IdeaInput;

