// Team Merging Agent - دمج الفرق
import { ProjectSubmission, getSubmittedProjects } from "./projectService";
import { IngestedProject } from "./projectIngestionAgent";
import { TeamProfile } from "./teamProfilingAgent";
import { createNotification } from "./notificationService";
import { getAllSupervisors } from "./userService";

export interface MergeAnalysis {
  project_a: {
    id: string;
    name: string;
    bootcamp: string;
    supervisor: string;
  };
  project_b: {
    id: string;
    name: string;
    bootcamp: string;
    supervisor: string;
  };
  merge_recommended: boolean;
  recommendation_strength: "weak" | "medium" | "strong";
  viability_scores: {
    similarity: number;
    skill_complementarity: number;
    scope_compatibility: number;
    timeline_alignment: number;
    supervisor_compatibility: number;
  };
  merged_project_proposal: {
    suggested_name: string;
    combined_scope: string;
    merged_team_structure: string[];
    expected_benefits: string[];
  };
  cross_bootcamp: boolean; // مشروعين من معسكرين مختلفين
}

class TeamMergingAgent {
  /**
   * تحليل فرصة الدمج
   */
  async analyzeMergeOpportunity(
    projectA: ProjectSubmission,
    projectB: ProjectSubmission,
    similarityScore: number,
    ingestedA?: IngestedProject,
    ingestedB?: IngestedProject,
    teamProfileA?: TeamProfile,
    teamProfileB?: TeamProfile
  ): Promise<MergeAnalysis> {
    const isCrossBootcamp = projectA.bootcamp_name !== projectB.bootcamp_name;

    // حساب درجات الجدوى
    const skillComplementarity = this.calculateSkillComplementarity(teamProfileA, teamProfileB);
    const scopeCompatibility = this.calculateScopeCompatibility(
      ingestedA?.structured_elements,
      ingestedB?.structured_elements
    );
    const timelineAlignment = this.calculateTimelineAlignment(projectA, projectB);
    const supervisorCompatibility = projectA.bootcamp_supervisor === projectB.bootcamp_supervisor ? 1.0 : 0.5;

    const viabilityScores = {
      similarity: similarityScore,
      skill_complementarity: skillComplementarity,
      scope_compatibility: scopeCompatibility,
      timeline_alignment: timelineAlignment,
      supervisor_compatibility: supervisorCompatibility,
    };

    // تحديد إذا كان الدمج موصى به
    const mergeRecommended = similarityScore >= 0.8 && scopeCompatibility >= 0.7;
    const recommendationStrength = this.calculateRecommendationStrength(viabilityScores);

    // توليد اقتراح المشروع المدمج
    const mergedProposal = this.generateMergedProposal(
      projectA,
      projectB,
      ingestedA,
      ingestedB,
      teamProfileA,
      teamProfileB
    );

    return {
      project_a: {
        id: projectA.id,
        name: projectA.project_name,
        bootcamp: projectA.bootcamp_name,
        supervisor: projectA.bootcamp_supervisor,
      },
      project_b: {
        id: projectB.id,
        name: projectB.project_name,
        bootcamp: projectB.bootcamp_name,
        supervisor: projectB.bootcamp_supervisor,
      },
      merge_recommended: mergeRecommended,
      recommendation_strength: recommendationStrength,
      viability_scores: viabilityScores,
      merged_project_proposal: mergedProposal,
      cross_bootcamp: isCrossBootcamp,
    };
  }

  /**
   * حساب تكامل المهارات
   */
  private calculateSkillComplementarity(
    profileA?: TeamProfile,
    profileB?: TeamProfile
  ): number {
    if (!profileA || !profileB) return 0.5; // قيمة افتراضية

    const skillsA = new Set(
      profileA.members.flatMap((m) => m.skills.technical.map((s) => s.skill.toLowerCase()))
    );
    const skillsB = new Set(
      profileB.members.flatMap((m) => m.skills.technical.map((s) => s.skill.toLowerCase()))
    );

    // حساب التداخل والتكامل
    const intersection = new Set([...skillsA].filter((s) => skillsB.has(s)));
    const union = new Set([...skillsA, ...skillsB]);

    // تكامل عالي = مهارات مختلفة ولكن متكاملة
    const complementarity = 1 - intersection.size / union.size;
    return Math.max(0.3, Math.min(1, complementarity + 0.2)); // ضمان حد أدنى
  }

  /**
   * حساب توافق النطاق
   */
  private calculateScopeCompatibility(
    elementsA?: { domain?: string; goals?: string[]; problem_statement?: string },
    elementsB?: { domain?: string; goals?: string[]; problem_statement?: string }
  ): number {
    if (!elementsA || !elementsB) return 0.7; // قيمة افتراضية

    let compatibility = 0;

    // مطابقة المجال
    if (elementsA.domain && elementsB.domain) {
      if (elementsA.domain === elementsB.domain) {
        compatibility += 0.4;
      } else if (elementsA.domain.toLowerCase().includes(elementsB.domain.toLowerCase()) ||
                 elementsB.domain.toLowerCase().includes(elementsA.domain.toLowerCase())) {
        compatibility += 0.2;
      }
    }

    // مطابقة الأهداف
    if (elementsA.goals && elementsB.goals) {
      const commonGoals = elementsA.goals.filter((g) =>
        elementsB.goals.some((g2) => g.toLowerCase().includes(g2.toLowerCase()) ||
                                    g2.toLowerCase().includes(g.toLowerCase()))
      );
      compatibility += (commonGoals.length / Math.max(elementsA.goals.length, elementsB.goals.length)) * 0.4;
    }

    // مطابقة بيان المشكلة
    if (elementsA.problem_statement && elementsB.problem_statement) {
      const similarity = this.textSimilarity(
        elementsA.problem_statement,
        elementsB.problem_statement
      );
      compatibility += similarity * 0.2;
    }

    return Math.min(1, compatibility);
  }

  /**
   * حساب محاذاة الجدول الزمني
   */
  private calculateTimelineAlignment(projectA: ProjectSubmission, projectB: ProjectSubmission): number {
    const dateA = new Date(projectA.submitted_at);
    const dateB = new Date(projectB.submitted_at);
    const diffDays = Math.abs((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));

    // إذا كان الفرق أقل من 30 يوم = محاذاة عالية
    if (diffDays < 30) return 0.9;
    if (diffDays < 60) return 0.7;
    if (diffDays < 90) return 0.5;
    return 0.3;
  }

  /**
   * حساب قوة التوصية
   */
  private calculateRecommendationStrength(scores: MergeAnalysis["viability_scores"]): "weak" | "medium" | "strong" {
    const avgScore =
      (scores.similarity +
        scores.skill_complementarity +
        scores.scope_compatibility +
        scores.timeline_alignment +
        scores.supervisor_compatibility) /
      5;

    if (avgScore >= 0.8) return "strong";
    if (avgScore >= 0.6) return "medium";
    return "weak";
  }

  /**
   * توليد اقتراح المشروع المدمج
   */
  private generateMergedProposal(
    projectA: ProjectSubmission,
    projectB: ProjectSubmission,
    ingestedA?: IngestedProject,
    ingestedB?: IngestedProject,
    teamProfileA?: TeamProfile,
    teamProfileB?: TeamProfile
  ): MergeAnalysis["merged_project_proposal"] {
    // دمج الأسماء
    const suggestedName = `${projectA.project_name} & ${projectB.project_name} - Integrated Platform`;

    // دمج النطاق
    const scopeA = ingestedA?.structured_elements.scope || projectA.project_description.substring(0, 200);
    const scopeB = ingestedB?.structured_elements.scope || projectB.project_description.substring(0, 200);
    const combinedScope = `${scopeA}\n\n${scopeB}\n\nالمشروع المدمج يجمع بين نقاط القوة في كلا المشروعين.`;

    // دمج الفريق
    const mergedTeam: string[] = [];
    if (teamProfileA) {
      mergedTeam.push(...teamProfileA.members.map((m) => m.full_name));
    }
    if (teamProfileB) {
      teamProfileB.members.forEach((m) => {
        if (!mergedTeam.includes(m.full_name)) {
          mergedTeam.push(m.full_name);
        }
      });
    }

    // الفوائد المتوقعة
    const benefits: string[] = [
      "فريق أكبر مع مهارات متنوعة",
      "نطاق مشروع أوسع وأقوى",
      "تكامل أفضل للموارد",
    ];

    if (projectA.bootcamp_name !== projectB.bootcamp_name) {
      benefits.push("دمج خبرات من معسكرين مختلفين");
    }

    return {
      suggested_name: suggestedName,
      combined_scope: combinedScope,
      merged_team_structure: mergedTeam,
      expected_benefits: benefits,
    };
  }

  /**
   * حساب التشابه النصي البسيط
   */
  private textSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  /**
   * البحث عن فرص الدمج
   */
  async findMergeOpportunities(
    newProject: ProjectSubmission,
    similarityResults: Array<{ project: { id: string }; similarity_score: number }>
  ): Promise<MergeAnalysis[]> {
    const allProjects = getSubmittedProjects();
    const mergeOpportunities: MergeAnalysis[] = [];

    for (const result of similarityResults) {
      if (result.similarity_score >= 0.7) {
        const existingProject = allProjects.find((p) => p.id === result.project.id);
        if (existingProject && existingProject.id !== newProject.id) {
          const analysis = await this.analyzeMergeOpportunity(
            newProject,
            existingProject,
            result.similarity_score
          );

          if (analysis.merge_recommended || analysis.cross_bootcamp) {
            mergeOpportunities.push(analysis);
          }
        }
      }
    }

    return mergeOpportunities;
  }

  /**
   * إرسال إشعارات للمشرفين عن فرص الدمج
   */
  async notifySupervisorsAboutMergeOpportunity(mergeAnalysis: MergeAnalysis): Promise<void> {
    const supervisors = getAllSupervisors();

    // إرسال إشعار للمشرفين المعنيين
    const relevantSupervisors = supervisors.filter(
      (s) =>
        s.name === mergeAnalysis.project_a.supervisor ||
        s.name === mergeAnalysis.project_b.supervisor
    );

    for (const supervisor of relevantSupervisors) {
      const isCrossBootcamp = mergeAnalysis.cross_bootcamp;
      const title = isCrossBootcamp
        ? `فرصة دمج: مشروعين من معسكرين مختلفين`
        : `فرصة دمج: مشروعين متشابهين`;

      const message = isCrossBootcamp
        ? `تم اكتشاف مشروعين متشابهين من معسكرين مختلفين:
        
المشروع 1: ${mergeAnalysis.project_a.name} (${mergeAnalysis.project_a.bootcamp})
المشروع 2: ${mergeAnalysis.project_b.name} (${mergeAnalysis.project_b.bootcamp})

درجة التشابه: ${(mergeAnalysis.viability_scores.similarity * 100).toFixed(0)}%
قوة التوصية: ${mergeAnalysis.recommendation_strength}

يمكن دمج المشروعين لإنتاج فكرة أقوى تجمع بين خبرات المعسكرين.`
        : `تم اكتشاف مشروعين متشابهين:
        
المشروع 1: ${mergeAnalysis.project_a.name}
المشروع 2: ${mergeAnalysis.project_b.name}

درجة التشابه: ${(mergeAnalysis.viability_scores.similarity * 100).toFixed(0)}%
قوة التوصية: ${mergeAnalysis.recommendation_strength}

يُنصح بمراجعة إمكانية الدمج.`;

      createNotification({
        type: "similarity_alert",
        recipient_id: supervisor.id,
        project_id: mergeAnalysis.project_a.id,
        title,
        message,
        severity: mergeAnalysis.recommendation_strength === "strong" ? "high" : "medium",
        status: "unread",
        metadata: {
          matched_project_id: mergeAnalysis.project_b.id,
          matched_project_name: mergeAnalysis.project_b.name,
          similarity_score: mergeAnalysis.viability_scores.similarity,
        },
      });
    }
  }
}

// Singleton instance
let mergingAgentInstance: TeamMergingAgent | null = null;

export const getTeamMergingAgent = (): TeamMergingAgent => {
  if (!mergingAgentInstance) {
    mergingAgentInstance = new TeamMergingAgent();
  }
  return mergingAgentInstance;
};

export const teamMergingAgent = {
  async findMergeOpportunities(
    newProject: ProjectSubmission,
    similarityResults: Array<{ project: { id: string }; similarity_score: number }>
  ): Promise<MergeAnalysis[]> {
    return getTeamMergingAgent().findMergeOpportunities(newProject, similarityResults);
  },
  async notifySupervisorsAboutMergeOpportunity(mergeAnalysis: MergeAnalysis): Promise<void> {
    return getTeamMergingAgent().notifySupervisorsAboutMergeOpportunity(mergeAnalysis);
  },
};

