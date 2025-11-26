// Service to manage project submissions
export interface TeamMember {
  full_name: string;
  academic_id?: string;
  phone_number?: string;
  email?: string;
}

export interface SupervisorResponse {
  id: string;
  supervisor_id: string;
  supervisor_name: string;
  message: string;
  response_type: "similarity_warning" | "approval" | "rejection" | "revision_request";
  created_at: string;
}

export interface ProjectSubmission {
  id: string;
  project_name: string;
  project_description: string;
  bootcamp_supervisor: string;
  bootcamp_name: string;
  tools_technologies: string[];
  team: TeamMember[];
  submitted_by: string; // user ID
  submitted_at: string;
  status: "pending_review" | "approved" | "needs_revision" | "rejected";
  similarity_alerts?: SimilarityAlert[];
  supervisor_responses?: SupervisorResponse[];
}

export interface SimilarityAlert {
  matched_project_id: string;
  matched_project_name: string;
  similarity_score: number;
  similarity_reasons: string[];
  alert_status: "pending" | "reviewed";
}

const STORAGE_KEY = "tuwaiq_submitted_projects";

// Get all submitted projects
export const getSubmittedProjects = (): ProjectSubmission[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading projects:", error);
    return [];
  }
};

// Save a new project submission
export const submitProject = (project: Omit<ProjectSubmission, "id" | "submitted_at" | "status">): ProjectSubmission => {
  const projects = getSubmittedProjects();
  
  const newProject: ProjectSubmission = {
    ...project,
    id: `PRJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    submitted_at: new Date().toISOString(),
    status: "pending_review",
  };

  projects.push(newProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  
  return newProject;
};

// Update project status
export const updateProjectStatus = (
  projectId: string,
  status: ProjectSubmission["status"]
): boolean => {
  try {
    const projects = getSubmittedProjects();
    const projectIndex = projects.findIndex((p) => p.id === projectId);
    
    if (projectIndex === -1) return false;
    
    projects[projectIndex].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch (error) {
    console.error("Error updating project:", error);
    return false;
  }
};

// Add similarity alert to project
export const addSimilarityAlert = (
  projectId: string,
  alert: SimilarityAlert
): boolean => {
  try {
    const projects = getSubmittedProjects();
    const projectIndex = projects.findIndex((p) => p.id === projectId);
    
    if (projectIndex === -1) return false;
    
    if (!projects[projectIndex].similarity_alerts) {
      projects[projectIndex].similarity_alerts = [];
    }
    
    projects[projectIndex].similarity_alerts!.push(alert);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch (error) {
    console.error("Error adding similarity alert:", error);
    return false;
  }
};

// Get projects by supervisor
export const getProjectsBySupervisor = (supervisorName: string): ProjectSubmission[] => {
  return getSubmittedProjects().filter(
    (p) => p.bootcamp_supervisor === supervisorName
  );
};

// Get projects by status
export const getProjectsByStatus = (status: ProjectSubmission["status"]): ProjectSubmission[] => {
  return getSubmittedProjects().filter((p) => p.status === status);
};

// Add supervisor response to a project
export const addSupervisorResponse = (
  projectId: string,
  response: Omit<SupervisorResponse, "id" | "created_at">
): boolean => {
  try {
    const projects = getSubmittedProjects();
    const projectIndex = projects.findIndex((p) => p.id === projectId);
    
    if (projectIndex === -1) return false;
    
    if (!projects[projectIndex].supervisor_responses) {
      projects[projectIndex].supervisor_responses = [];
    }
    
    const newResponse: SupervisorResponse = {
      ...response,
      id: `RESP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };
    
    projects[projectIndex].supervisor_responses!.push(newResponse);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch (error) {
    console.error("Error adding supervisor response:", error);
    return false;
  }
};

// Get project by ID
export const getProjectById = (projectId: string): ProjectSubmission | null => {
  const projects = getSubmittedProjects();
  return projects.find((p) => p.id === projectId) || null;
};

