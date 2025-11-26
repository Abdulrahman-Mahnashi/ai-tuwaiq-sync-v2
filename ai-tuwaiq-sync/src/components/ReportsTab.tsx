import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ReportsTabProps {
  language: "en" | "ar";
}

const ReportsTab = ({ language }: ReportsTabProps) => {
  const translations = {
    ar: {
      title: "التقارير",
      subtitle: "تقارير شاملة ثنائية اللغة",
      comingSoon: "قريباً",
      description: "إنشاء تقارير تفصيلية بصيغة PDF أو Markdown للمشاريع وخطط التعاون",
    },
    en: {
      title: "Reports",
      subtitle: "Comprehensive bilingual reports",
      comingSoon: "Coming Soon",
      description: "Generate detailed reports in PDF or Markdown for projects and collaboration plans",
    },
  };

  const t = translations[language];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 gradient-text">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <Card className="glass p-12 neon-border text-center">
        <FileText className="h-24 w-24 mx-auto mb-4 text-primary animate-pulse-glow" />
        <h3 className="text-2xl font-bold mb-2 text-primary">{t.comingSoon}</h3>
        <p className="text-muted-foreground">{t.description}</p>
      </Card>
    </div>
  );
};

export default ReportsTab;
