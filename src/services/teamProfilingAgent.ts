// Team Profiling Agent - تحليل ملفات الفريق
import { TeamMember } from "./projectService";

export interface TeamMemberProfile {
  member_id: string;
  full_name: string;
  contact: {
    email?: string;
    phone?: string;
    academic_id?: string;
  };
  skills: {
    technical: Array<{
      skill: string;
      level: "beginner" | "intermediate" | "advanced";
      years?: number;
    }>;
    soft_skills: string[];
  };
  experience: {
    previous_projects: number;
    internships?: number;
    certifications?: string[];
  };
  role_fit: Record<string, number>; // role -> score
  preferences: {
    preferred_roles?: string[];
    work_style?: string;
  };
}

export interface TeamProfile {
  team_id: string;
  size: number;
  members: TeamMemberProfile[];
  team_composition: {
    skill_coverage: Record<string, "weak" | "moderate" | "strong">;
    gaps: string[];
    strengths: string[];
  };
}

class TeamProfilingAgent {
  /**
   * إنشاء ملف تعريف لعضو الفريق
   */
  async profileTeamMember(member: TeamMember): Promise<TeamMemberProfile> {
    // في الإنتاج، سيتم جلب البيانات من قاعدة بيانات طويق
    // حالياً: إنشاء ملف تعريف أساسي
    
    const memberId = member.academic_id || member.email || member.phone_number || `MEMBER-${Date.now()}`;
    
    // استخراج المهارات من البيانات المتاحة (سيتم تحسينه لاحقاً)
    const technicalSkills = this.inferSkillsFromData(member);
    
    return {
      member_id: memberId,
      full_name: member.full_name,
      contact: {
        email: member.email,
        phone: member.phone_number,
        academic_id: member.academic_id,
      },
      skills: {
        technical: technicalSkills,
        soft_skills: ["Communication", "Teamwork", "Problem-solving"],
      },
      experience: {
        previous_projects: 0, // سيتم جلبها من قاعدة البيانات
        internships: 0,
        certifications: [],
      },
      role_fit: this.calculateRoleFit(technicalSkills),
      preferences: {
        preferred_roles: [],
        work_style: "collaborative",
      },
    };
  }

  /**
   * استنتاج المهارات من البيانات المتاحة
   */
  private inferSkillsFromData(member: TeamMember): Array<{
    skill: string;
    level: "beginner" | "intermediate" | "advanced";
  }> {
    // في الإنتاج، سيتم جلب المهارات من قاعدة بيانات طويق
    // حالياً: قائمة افتراضية
    return [
      { skill: "General Programming", level: "intermediate" },
    ];
  }

  /**
   * حساب ملاءمة الأدوار
   */
  private calculateRoleFit(skills: Array<{ skill: string; level: string }>): Record<string, number> {
    const roleFit: Record<string, number> = {
      "Full-stack Developer": 0.5,
      "Backend Engineer": 0.5,
      "Frontend Engineer": 0.5,
    };

    // تحسين بناءً على المهارات
    skills.forEach(({ skill, level }) => {
      const levelScore = level === "advanced" ? 0.3 : level === "intermediate" ? 0.2 : 0.1;
      
      if (/python|java|node|backend/i.test(skill)) {
        roleFit["Backend Engineer"] = Math.min(1, (roleFit["Backend Engineer"] || 0) + levelScore);
      }
      if (/react|vue|angular|frontend/i.test(skill)) {
        roleFit["Frontend Engineer"] = Math.min(1, (roleFit["Frontend Engineer"] || 0) + levelScore);
      }
      if (/ml|ai|data|tensorflow/i.test(skill)) {
        roleFit["ML Engineer"] = Math.min(1, (roleFit["ML Engineer"] || 0) + levelScore);
        roleFit["Data Scientist"] = Math.min(1, (roleFit["Data Scientist"] || 0) + levelScore);
      }
    });

    return roleFit;
  }

  /**
   * تحليل تكوين الفريق
   */
  async profileTeam(teamMembers: TeamMember[], projectId: string): Promise<TeamProfile> {
    const memberProfiles = await Promise.all(
      teamMembers.map((member) => this.profileTeamMember(member))
    );

    // تحليل التغطية
    const skillCoverage = this.analyzeSkillCoverage(memberProfiles);
    const gaps = this.identifyGaps(memberProfiles);
    const strengths = this.identifyStrengths(memberProfiles);

    return {
      team_id: `TEAM-${projectId}`,
      size: teamMembers.length,
      members: memberProfiles,
      team_composition: {
        skill_coverage: skillCoverage,
        gaps,
        strengths,
      },
    };
  }

  /**
   * تحليل تغطية المهارات
   */
  private analyzeSkillCoverage(profiles: TeamMemberProfile[]): Record<string, "weak" | "moderate" | "strong"> {
    const coverage: Record<string, "weak" | "moderate" | "strong"> = {
      "ML/AI": "weak",
      "Backend": "weak",
      "Frontend": "weak",
      "DevOps": "weak",
      "Design": "weak",
    };

    profiles.forEach((profile) => {
      profile.skills.technical.forEach(({ skill, level }) => {
        if (/ml|ai|tensorflow|pytorch/i.test(skill)) {
          coverage["ML/AI"] = this.upgradeCoverage(coverage["ML/AI"], level);
        }
        if (/backend|server|api|node|python|java/i.test(skill)) {
          coverage["Backend"] = this.upgradeCoverage(coverage["Backend"], level);
        }
        if (/frontend|react|vue|angular|ui/i.test(skill)) {
          coverage["Frontend"] = this.upgradeCoverage(coverage["Frontend"], level);
        }
        if (/devops|docker|kubernetes|ci|cd/i.test(skill)) {
          coverage["DevOps"] = this.upgradeCoverage(coverage["DevOps"], level);
        }
        if (/design|ui|ux|figma/i.test(skill)) {
          coverage["Design"] = this.upgradeCoverage(coverage["Design"], level);
        }
      });
    });

    return coverage;
  }

  private upgradeCoverage(
    current: "weak" | "moderate" | "strong",
    level: string
  ): "weak" | "moderate" | "strong" {
    if (current === "strong") return "strong";
    if (level === "advanced") return "strong";
    if (level === "intermediate" && current === "weak") return "moderate";
    return current;
  }

  /**
   * تحديد الفجوات
   */
  private identifyGaps(profiles: TeamMemberProfile[]): string[] {
    const gaps: string[] = [];
    const allSkills = new Set<string>();

    profiles.forEach((profile) => {
      profile.skills.technical.forEach(({ skill }) => {
        allSkills.add(skill.toLowerCase());
      });
    });

    // تحديد الفجوات الشائعة
    const commonRoles = ["DevOps Engineer", "UI/UX Designer", "QA Engineer"];
    commonRoles.forEach((role) => {
      if (!Array.from(allSkills).some((skill) => role.toLowerCase().includes(skill))) {
        gaps.push(role);
      }
    });

    return gaps;
  }

  /**
   * تحديد نقاط القوة
   */
  private identifyStrengths(profiles: TeamMemberProfile[]): string[] {
    const strengths: string[] = [];
    const skillCounts: Record<string, number> = {};

    profiles.forEach((profile) => {
      profile.skills.technical.forEach(({ skill, level }) => {
        const score = level === "advanced" ? 2 : level === "intermediate" ? 1 : 0.5;
        skillCounts[skill] = (skillCounts[skill] || 0) + score;
      });
    });

    // إيجاد المهارات الأقوى
    const sortedSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    sortedSkills.forEach(([skill]) => {
      strengths.push(skill);
    });

    return strengths.length > 0 ? strengths : ["Strong technical foundation"];
  }
}

// Singleton instance
let profilingAgentInstance: TeamProfilingAgent | null = null;

export const getTeamProfilingAgent = (): TeamProfilingAgent => {
  if (!profilingAgentInstance) {
    profilingAgentInstance = new TeamProfilingAgent();
  }
  return profilingAgentInstance;
};

export const teamProfilingAgent = {
  async profileTeam(teamMembers: TeamMember[], projectId: string): Promise<TeamProfile> {
    return getTeamProfilingAgent().profileTeam(teamMembers, projectId);
  },
};

