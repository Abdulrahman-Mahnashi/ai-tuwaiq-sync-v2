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
        const response = await fetch(LOCAL_PROJECTS_PATH, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const rawProjects: LocalProject[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.projects)
            ? data.projects
            : [];

        if (!isMounted) return;

        const normalized = rawProjects.map((project, index) =>
          normalizeProject(project, (index + 1).toString())
        );

        setProjects(normalized);
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


