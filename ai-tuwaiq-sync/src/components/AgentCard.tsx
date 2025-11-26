import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AgentCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: "emerald" | "teal" | "amber";
  delay: number;
}

const colorClasses: Record<AgentCardProps["color"], string> = {
  emerald: "text-emerald-300 border-emerald-400/60",
  teal: "text-cyan-300 border-cyan-400/60",
  amber: "text-amber-300 border-amber-400/60",
};

const badgeGradients: Record<AgentCardProps["color"], string> = {
  emerald: "from-emerald-500/25 via-emerald-400/20 to-transparent",
  teal: "from-cyan-500/25 via-cyan-400/20 to-transparent",
  amber: "from-amber-400/30 via-amber-300/20 to-transparent",
};

const AgentCard = ({ icon: Icon, title, description, color, delay }: AgentCardProps) => (
  <Card
    className={`glass p-6 border border-white/5 hover:shadow-xl transition-all duration-500 animate-float hover:-translate-y-2 ${colorClasses[color]}`}
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="flex flex-col items-center text-center space-y-5">
      <div
        className={`p-4 rounded-xl bg-gradient-to-br ${badgeGradients[color]} border border-white/10 shadow-lg`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold tracking-wide">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </Card>
);

export default AgentCard;
