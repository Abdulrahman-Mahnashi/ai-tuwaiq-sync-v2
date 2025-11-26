// Role Recommendation Agent - توزيع الأدوار
import { TeamProfile, TeamMemberProfile } from "./teamProfilingAgent";
import { ProjectElements } from "./projectIngestionAgent";

export interface RoleAssignment {
  member_name: string;
  member_id: string;
  assigned_role: string;
  confidence_score: number;
  reasoning: string;
  alternative_roles: Array<{
    role: string;
    score: number;
    reason: string;
  }>;
  responsibilities: string[];
}

export interface RoleRecommendationResult {
  role_assignments: RoleAssignment[];
  team_gaps: Array<{
    missing_role: string;
    importance: "low" | "medium" | "high";
    recommendation: string;
  }>;
}

class RoleRecommendationAgent {
  private readonly availableRoles = [
    "ML Engineer",
    "Data Engineer",
    "Backend Engineer",
    "Frontend Engineer",
    "Full-stack Developer",
    "UI/UX Designer",
    "DevOps Engineer",
    "Product Manager",
    "QA Engineer",
    "Data Scientist",
  ];

  /**
   * تحديد الأدوار المطلوبة للمشروع
   */
  private identifyRequiredRoles(projectElements: ProjectElements): string[] {
    const requiredRoles: string[] = [];
    const domain = projectElements.domain.toLowerCase();
    const technologies = projectElements.technology_stack.map((t) => t.toLowerCase());

    // تحديد الأدوار بناءً على المجال والتقنيات
    if (domain.includes("ai") || domain.includes("ml") || technologies.some((t) => /ai|ml|tensorflow|pytorch/i.test(t))) {
      requiredRoles.push("ML Engineer");
      requiredRoles.push("Data Engineer");
    }

    if (technologies.some((t) => /react|vue|angular|frontend|html|css/i.test(t))) {
      requiredRoles.push("Frontend Engineer");
    }

    if (technologies.some((t) => /node|python|java|backend|api|server/i.test(t))) {
      requiredRoles.push("Backend Engineer");
    }

    if (requiredRoles.includes("Frontend Engineer") && requiredRoles.includes("Backend Engineer")) {
      requiredRoles.push("Full-stack Developer");
      // إزالة التكرار
      const index = requiredRoles.indexOf("Frontend Engineer");
      if (index > -1) requiredRoles.splice(index, 1);
      const index2 = requiredRoles.indexOf("Backend Engineer");
      if (index2 > -1) requiredRoles.splice(index2, 1);
    }

    // إضافة أدوار أساسية
    if (!requiredRoles.includes("Product Manager") && projectElements.goals.length > 3) {
      requiredRoles.push("Product Manager");
    }

    return requiredRoles.length > 0 ? requiredRoles : ["Full-stack Developer"];
  }

  /**
   * حساب ملاءمة الدور للعضو
   */
  private calculateRoleFit(
    member: TeamMemberProfile,
    role: string,
    projectElements: ProjectElements
  ): number {
    // البدء بدرجة الملاءمة من ملف التعريف
    let score = member.role_fit[role] || 0;

    // تحسين بناءً على المهارات
    member.skills.technical.forEach(({ skill, level }) => {
      const levelMultiplier = level === "advanced" ? 0.2 : level === "intermediate" ? 0.1 : 0.05;
      
      // مطابقة المهارات مع متطلبات الدور
      if (this.skillMatchesRole(skill, role)) {
        score += levelMultiplier;
      }
    });

    // تحسين بناءً على التفضيلات
    if (member.preferences.preferred_roles?.includes(role)) {
      score += 0.15;
    }

    // تحسين بناءً على الخبرة
    if (member.experience.previous_projects > 0) {
      score += Math.min(0.1, member.experience.previous_projects * 0.02);
    }

    return Math.min(1, score);
  }

  /**
   * التحقق من مطابقة المهارة للدور
   */
  private skillMatchesRole(skill: string, role: string): boolean {
    const skillLower = skill.toLowerCase();
    const roleLower = role.toLowerCase();

    const roleSkillMap: Record<string, string[]> = {
      "ml engineer": ["python", "tensorflow", "pytorch", "ml", "ai", "neural", "deep learning"],
      "data engineer": ["python", "sql", "data", "etl", "pipeline", "spark"],
      "backend engineer": ["node", "python", "java", "api", "server", "backend", "database"],
      "frontend engineer": ["react", "vue", "angular", "javascript", "html", "css", "frontend"],
      "full-stack developer": ["react", "node", "python", "javascript", "full", "stack"],
      "ui/ux designer": ["design", "figma", "ui", "ux", "prototype", "wireframe"],
      "devops engineer": ["docker", "kubernetes", "ci", "cd", "aws", "azure", "devops"],
      "qa engineer": ["testing", "qa", "quality", "automation", "selenium"],
      "data scientist": ["python", "data", "analytics", "pandas", "numpy", "statistics"],
    };

    const requiredSkills = roleSkillMap[roleLower] || [];
    return requiredSkills.some((reqSkill) => skillLower.includes(reqSkill));
  }

  /**
   * توليد المسؤوليات للدور
   */
  private generateResponsibilities(role: string, projectElements: ProjectElements): string[] {
    const responsibilities: Record<string, string[]> = {
      "ML Engineer": [
        "تصميم وتنفيذ نماذج ML",
        "تحسين أداء النماذج",
        "معالجة البيانات للتدريب",
      ],
      "Backend Engineer": [
        "تطوير واجهات برمجية (APIs)",
        "إدارة قاعدة البيانات",
        "تطوير منطق الخادم",
      ],
      "Frontend Engineer": [
        "تطوير واجهة المستخدم",
        "تحسين تجربة المستخدم",
        "التكامل مع APIs",
      ],
      "Full-stack Developer": [
        "تطوير الواجهة الأمامية والخلفية",
        "التكامل بين المكونات",
        "إدارة قاعدة البيانات",
      ],
      "Product Manager": [
        "تخطيط المشروع",
        "إدارة المتطلبات",
        "التنسيق بين الفريق",
      ],
    };

    return responsibilities[role] || [`تنفيذ مهام ${role}`];
  }

  /**
   * توصية الأدوار للفريق
   */
  async recommendRoles(
    teamProfile: TeamProfile,
    projectElements: ProjectElements
  ): Promise<RoleRecommendationResult> {
    const requiredRoles = this.identifyRequiredRoles(projectElements);
    const assignments: RoleAssignment[] = [];
    const assignedRoles = new Set<string>();

    // توزيع الأدوار على الأعضاء
    for (const member of teamProfile.members) {
      const roleScores: Record<string, number> = {};

      // حساب الدرجات لجميع الأدوار المطلوبة
      requiredRoles.forEach((role) => {
        if (!assignedRoles.has(role)) {
          roleScores[role] = this.calculateRoleFit(member, role, projectElements);
        }
      });

      // إذا لم تكن هناك أدوار متاحة، استخدم جميع الأدوار
      if (Object.keys(roleScores).length === 0) {
        this.availableRoles.forEach((role) => {
          roleScores[role] = this.calculateRoleFit(member, role, projectElements);
        });
      }

      // اختيار أفضل دور
      const sortedRoles = Object.entries(roleScores).sort(([, a], [, b]) => b - a);
      const bestRole = sortedRoles[0];
      const alternatives = sortedRoles.slice(1, 3);

      if (bestRole && bestRole[1] > 0.3) {
        assignments.push({
          member_name: member.full_name,
          member_id: member.member_id,
          assigned_role: bestRole[0],
          confidence_score: bestRole[1],
          reasoning: this.generateReasoning(member, bestRole[0], bestRole[1]),
          alternative_roles: alternatives.map(([role, score]) => ({
            role,
            score,
            reason: `درجة ملاءمة: ${(score * 100).toFixed(0)}%`,
          })),
          responsibilities: this.generateResponsibilities(bestRole[0], projectElements),
        });

        assignedRoles.add(bestRole[0]);
      }
    }

    // تحديد الفجوات
    const gaps = this.identifyTeamGaps(requiredRoles, assignedRoles);

    return {
      role_assignments: assignments,
      team_gaps: gaps,
    };
  }

  /**
   * توليد التفسير
   */
  private generateReasoning(member: TeamMemberProfile, role: string, score: number): string {
    const reasons: string[] = [];

    if (member.role_fit[role] && member.role_fit[role] > 0.7) {
      reasons.push(`ملاءمة عالية للدور (${(member.role_fit[role] * 100).toFixed(0)}%)`);
    }

    const relevantSkills = member.skills.technical.filter(({ skill }) =>
      this.skillMatchesRole(skill, role)
    );
    if (relevantSkills.length > 0) {
      reasons.push(`يمتلك مهارات ذات صلة: ${relevantSkills.map((s) => s.skill).join(", ")}`);
    }

    if (member.preferences.preferred_roles?.includes(role)) {
      reasons.push("الدور من ضمن التفضيلات");
    }

    return reasons.length > 0
      ? reasons.join(". ")
      : `درجة ملاءمة: ${(score * 100).toFixed(0)}% بناءً على الملف الشخصي`;
  }

  /**
   * تحديد فجوات الفريق
   */
  private identifyTeamGaps(
    requiredRoles: string[],
    assignedRoles: Set<string>
  ): Array<{ missing_role: string; importance: "low" | "medium" | "high"; recommendation: string }> {
    const gaps: Array<{ missing_role: string; importance: "low" | "medium" | "high"; recommendation: string }> = [];

    requiredRoles.forEach((role) => {
      if (!assignedRoles.has(role)) {
        const importance: "low" | "medium" | "high" =
          role === "ML Engineer" || role === "Backend Engineer" ? "high" :
          role === "Frontend Engineer" ? "medium" : "low";

        gaps.push({
          missing_role: role,
          importance,
          recommendation: `يُنصح بإضافة ${role} للفريق لتحسين التغطية`,
        });
      }
    });

    return gaps;
  }
}

// Singleton instance
let roleAgentInstance: RoleRecommendationAgent | null = null;

export const getRoleRecommendationAgent = (): RoleRecommendationAgent => {
  if (!roleAgentInstance) {
    roleAgentInstance = new RoleRecommendationAgent();
  }
  return roleAgentInstance;
};

export const roleRecommendationAgent = {
  async recommendRoles(
    teamProfile: TeamProfile,
    projectElements: ProjectElements
  ): Promise<RoleRecommendationResult> {
    return getRoleRecommendationAgent().recommendRoles(teamProfile, projectElements);
  },
};

