// Workflow Orchestrator - تنسيق جميع الـ Agents
import { ProjectSubmission, submitProject, addSimilarityAlert } from "./projectService";
import { projectIngestionAgent, IngestedProject } from "./projectIngestionAgent";
import { teamProfilingAgent, TeamProfile } from "./teamProfilingAgent";
import { roleRecommendationAgent, RoleRecommendationResult } from "./roleRecommendationAgent";
import { teamMergingAgent, MergeAnalysis } from "./teamMergingAgent";
import { aiAgentService } from "./aiAgent";
import { createNotification } from "./notificationService";

export interface WorkflowResult {
  project: ProjectSubmission;
  ingested: IngestedProject;
  teamProfile: TeamProfile;
  roleRecommendations: RoleRecommendationResult;
  similarityResults: Array<{
    project: { id: string; title: string };
    similarity_score: number;
    reasoning?: string;
  }>;
  mergeOpportunities: MergeAnalysis[];
}

class WorkflowOrchestrator {
  /**
   * تنفيذ سير العمل الكامل بعد تقديم المشروع
   */
  async executeWorkflow(
    projectData: {
      project_name: string;
      project_description: string;
      bootcamp_supervisor: string;
      bootcamp_name: string;
      tools_technologies: string[];
      team: Array<{
        full_name: string;
        academic_id?: string;
        phone_number?: string;
        email?: string;
      }>;
      submitted_by: string;
    },
    existingProjects: Array<{
      id: string;
      title: string;
      description: string;
      bootcamp?: string;
      technologies: string[];
    }>
  ): Promise<WorkflowResult> {
    console.log("🚀 Starting Workflow Orchestration...");

    // Step 1: حفظ المشروع
    console.log("📝 Step 1: Saving project...");
    const submittedProject = submitProject(projectData);

    // Step 2: Project Ingestion Agent
    console.log("📦 Step 2: Project Ingestion Agent...");
    const ingested = await projectIngestionAgent.ingestProject(
      submittedProject.id,
      projectData.project_name,
      projectData.project_description,
      projectData.bootcamp_name,
      projectData.bootcamp_supervisor,
      projectData.tools_technologies
    );

    // Step 3: Team Profiling Agent
    console.log("👥 Step 3: Team Profiling Agent...");
    const teamProfile = await teamProfilingAgent.profileTeam(
      projectData.team,
      submittedProject.id
    );

    // Step 4: Role Recommendation Agent
    console.log("🎭 Step 4: Role Recommendation Agent...");
    const roleRecommendations = await roleRecommendationAgent.recommendRoles(
      teamProfile,
      ingested.structured_elements
    );

    // Step 5: Similarity Analysis Agent
    console.log("🔍 Step 5: Similarity Analysis Agent...");
    const similarityResults = await aiAgentService.calculateSimilarity(
      `${projectData.project_name} ${projectData.project_description}`,
      existingProjects
    );

    // Step 6: إضافة تنبيهات التشابه
    console.log("⚠️ Step 6: Adding similarity alerts...");
    similarityResults.forEach((result) => {
      if (result.similarity_score >= 0.7) {
        addSimilarityAlert(submittedProject.id, {
          matched_project_id: result.project.id,
          matched_project_name: result.project.title,
          similarity_score: result.similarity_score,
          similarity_reasons: result.reasoning
            ? [result.reasoning]
            : [
                `Similarity: ${(result.similarity_score * 100).toFixed(0)}%`,
                `Technology overlap: ${result.project.technologies?.join(", ") || "N/A"}`,
              ],
          alert_status: "pending",
        });
      }
    });

    // Step 7: Team Merging Agent
    console.log("🔗 Step 7: Team Merging Agent...");
    const mergeOpportunities = await teamMergingAgent.findMergeOpportunities(
      submittedProject,
      similarityResults.map((r) => ({
        project: { id: r.project.id },
        similarity_score: r.similarity_score,
      }))
    );

    // Step 8: إرسال إشعارات للطلاب
    console.log("📧 Step 8: Sending notifications to students...");
    similarityResults.forEach((result) => {
      if (result.similarity_score >= 0.7) {
        projectData.team.forEach((member) => {
          createNotification({
            type: "similarity_alert",
            recipient_id: projectData.submitted_by,
            project_id: submittedProject.id,
            title: `تنبيه تشابه: ${(result.similarity_score * 100).toFixed(0)}%`,
            message: `مشروعك "${projectData.project_name}" مشابه بنسبة ${(result.similarity_score * 100).toFixed(0)}% للمشروع "${result.project.title}"`,
            severity: result.similarity_score >= 0.8 ? "high" : "medium",
            status: "unread",
            metadata: {
              similarity_score: result.similarity_score,
              matched_project_id: result.project.id,
              matched_project_name: result.project.title,
            },
          });
        });
      }
    });

    // Step 9: إرسال إشعارات للمشرفين عن فرص الدمج
    console.log("📧 Step 9: Sending merge opportunity notifications to supervisors...");
    for (const mergeOpp of mergeOpportunities) {
      await teamMergingAgent.notifySupervisorsAboutMergeOpportunity(mergeOpp);
    }

    console.log("✅ Workflow Orchestration Complete!");

    return {
      project: submittedProject,
      ingested,
      teamProfile,
      roleRecommendations,
      similarityResults: similarityResults.map((r) => ({
        project: { id: r.project.id, title: r.project.title },
        similarity_score: r.similarity_score,
        reasoning: r.reasoning,
      })),
      mergeOpportunities,
    };
  }
}

// Singleton instance
let orchestratorInstance: WorkflowOrchestrator | null = null;

export const getWorkflowOrchestrator = (): WorkflowOrchestrator => {
  if (!orchestratorInstance) {
    orchestratorInstance = new WorkflowOrchestrator();
  }
  return orchestratorInstance;
};

export const workflowOrchestrator = {
  async executeWorkflow(
    projectData: {
      project_name: string;
      project_description: string;
      bootcamp_supervisor: string;
      bootcamp_name: string;
      tools_technologies: string[];
      team: Array<{
        full_name: string;
        academic_id?: string;
        phone_number?: string;
        email?: string;
      }>;
      submitted_by: string;
    },
    existingProjects: Array<{
      id: string;
      title: string;
      description: string;
      bootcamp?: string;
      technologies: string[];
    }>
  ): Promise<WorkflowResult> {
    return getWorkflowOrchestrator().executeWorkflow(projectData, existingProjects);
  },
};

