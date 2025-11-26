import { useEffect, useState } from "react";

export interface LocalProject {
  id?: string;
  title?: string;
  name?: string;
  project_title?: string;
  description?: string;
  desc?: string;
  project_description?: string;
  bootcamp?: string;
  bootcamp_name?: string;
  program?: string;
  technologies?: string[];
  tech?: string[];
  tech_stack?: string[];
  team_members?: string[];
  team?: string[];
  members?: string[];
  status?: string;
}

export interface UseLocalProjectsResult {
  projects: NormalizedProject[];
  isLoading: boolean;
  error: string | null;
}

export interface NormalizedProject {
  id: string;
  title: string;
  description: string;
  bootcamp: string | null;
  technologies: string[];
  team_members: string[];
  status: string;
}

const LOCAL_PROJECTS_PATH = "/data/projects-local.json";

function normalizeProject(project: LocalProject, fallbackId: string): NormalizedProject {
  const title =
    project.title ||
    project.name ||
    project.project_title ||
    (project as any).project_name_ar ||
    (project as any).project_name_en ||
    `Project ${fallbackId}`;

  const description =
    project.description ||
    project.desc ||
    project.project_description ||
    (project as any).description_ar ||
    (project as any).description_en ||
    "";

  const bootcamp =
    project.bootcamp ||
    project.bootcamp_name ||
    project.program ||
    (project as any).bootcamp_name_ar ||
    (project as any).Bootcamp ||
    null;

  const technologies =
    project.technologies ||
    project.tech ||
    project.tech_stack ||
    (project as any).tools ||
    [];

  const teamMembersRaw =
    project.team_members ||
    project.team ||
    project.members ||
    (project as any).team ||
    [];

  const teamMembers = Array.isArray(teamMembersRaw)
    ? teamMembersRaw.map((member: any) =>
        typeof member === "string"
          ? member
          : member?.name_ar || member?.name_en || member?.fullName || "عضو غير معروف"
      )
    : [];

  return {
    id: project.id || title || fallbackId,
    title,
    description,
    bootcamp,
    technologies: Array.isArray(technologies) ? technologies : [],
    team_members: teamMembers,
    status: project.status || (project as any).Status || "pending",
  };
}

export function useLocalProjects(): UseLocalProjectsResult {
  const [projects, setProjects] = useState<NormalizedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        const allProjects: NormalizedProject[] = [];

        // Load from JSON file (if exists)
        try {
          const response = await fetch(LOCAL_PROJECTS_PATH, {
            cache: "no-store",
          });

          if (response.ok) {
            const data = await response.json();
            const rawProjects: LocalProject[] = Array.isArray(data)
              ? data
              : Array.isArray(data?.projects)
                ? data.projects
                : [];

            const normalized = rawProjects.map((project, index) =>
              normalizeProject(project, (index + 1).toString())
            );
            allProjects.push(...normalized);
          }
        } catch (fileError) {
          console.warn("Could not load projects from file:", fileError);
        }

        // Load from localStorage (uploaded projects)
        try {
          const storedProjects = JSON.parse(localStorage.getItem("tuwaiq_local_projects") || "[]");
          if (Array.isArray(storedProjects)) {
            const normalized = storedProjects.map((project: any, index: number) =>
              normalizeProject(project, `local-${index}`)
            );
            allProjects.push(...normalized);
          }
        } catch (storageError) {
          console.warn("Could not load projects from localStorage:", storageError);
        }

        // Load submitted projects and convert them
        try {
          const submittedProjects = JSON.parse(localStorage.getItem("tuwaiq_submitted_projects") || "[]");
          if (Array.isArray(submittedProjects)) {
            const converted = submittedProjects.map((project: any) => ({
              id: project.id,
              title: project.project_name,
              description: project.project_description,
              bootcamp: project.bootcamp_name,
              technologies: project.tools_technologies || [],
              team_members: project.team?.map((t: any) => t.full_name) || [],
              status: project.status || "pending",
            }));
            allProjects.push(...converted);
          }
        } catch (submittedError) {
          console.warn("Could not load submitted projects:", submittedError);
        }

        if (!isMounted) return;

        // Remove duplicates based on title
        const uniqueProjects = allProjects.filter(
          (project, index, self) =>
            index === self.findIndex((p) => p.title === project.title)
        );

        setProjects(uniqueProjects);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setProjects([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { projects, isLoading, error };
}


