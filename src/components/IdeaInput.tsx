import { useState } from "react";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SimilarProjects from "./SimilarProjects";
import { useLocalProjects } from "@/services/localProjects";
import { aiAgentService } from "@/services/aiAgent";

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
      // استخدام AI Agent (Gemini) فقط - بدون خوارزميات بسيطة
      const results = await aiAgentService.calculateSimilarity(idea, localProjects);

      // تحويل النتائج للصيغة المطلوبة
      const similar = results.map((result) => ({
        id: result.project.id,
        title: result.project.title,
        description: result.project.description,
        bootcamp: result.project.bootcamp,
        technologies: result.project.technologies,
        team_members: result.project.team_members,
        similarity_score: result.similarity_score,
      })) as SimilarProject[];

      setSimilarProjects(similar);

      // Toast message
      toast({
        title: similar.length > 0 ? t.success : t.noSimilarProjects,
        description:
          similar.length > 0
            ? `${similar.length} ${t.foundSimilar} ${language === "ar" ? "(باستخدام OpenAI)" : "(using OpenAI)"}`
            : language === "ar"
              ? "لم يتم العثور على مشاريع مشابهة."
              : "No similar projects found.",
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

