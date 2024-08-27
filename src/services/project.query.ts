import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getChallengeTProjects,
  getGitHubRepos,
  getProject,
  getProjectRating,
  getProjectRepoStats,
  updateProject,
  updateProjectRating,
  putProjectStatus,
  getProjects,
  getProjectTags,
  fetchGithubTagsByurl,
} from "./project";
import {
  ChallengeID,
  ProjectId,
  TeamID,
  ProjectStatus,
  Project,
} from "./types";

export function useFetchChallengeProjects(challengeId: ChallengeID) {
  return useQuery({
    queryKey: ["campaigns", challengeId, "projects"],
    queryFn: async () => {
      return getChallengeTProjects(challengeId);
    },
  });
}

export function useFetchProjects(
  limit = 20,
  tags?: string[],
  cursorId?: string
) {
  const projectKey = tags ? tags : ["all"];
  const cursorIdKey = cursorId ? cursorId : "none";
  return useQuery({
    queryKey: ["projects", ...projectKey, limit, cursorIdKey],
    queryFn: async () => {
      return getProjects(limit, tags, cursorId);
    },
  });
}

export function useFetchProjectGithubTags(projects: Project[]) {
  return useQueries({
    queries: projects.map((project) => {
      return {
        queryKey: ["project", "github-tags", project.id],
        queryFn: () =>
          fetchGithubTagsByurl(project.githubURI || "", project.id),
        enabled: !!project.githubURI,
        cacheTime: 1000 * 60 * 60 * 24,
      };
    }),
  });
}

export function useFetchProjectTags() {
  return useQuery({
    queryKey: ["projects", "tags"],
    queryFn: async () => {
      return getProjectTags();
    },
  });
}

export function useFetchProject(projectId: ProjectId) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      return getProject(projectId);
    },
  });
}
export function useFetchProjectRating(projectId: ProjectId, enable: boolean) {
  return useQuery({
    queryKey: ["project", projectId, "rating"],
    enabled: enable,
    queryFn: async () => {
      return getProjectRating(projectId);
    },
  });
}

export function useFetchProjectGitHubRepos(teamId: TeamID) {
  return useQuery({
    queryKey: ["project", "repos", teamId],
    queryFn: async () => {
      return getGitHubRepos(teamId);
    },
  });
}

export function useFetchProjectRepoStats(teamId: TeamID, githubURI: string) {
  return useQuery({
    queryKey: ["project", "repos-stats", teamId, githubURI],
    queryFn: async () => {
      return getProjectRepoStats(teamId, githubURI);
    },
  });
}

export function useMutationUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation(updateProject, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(["project", data.id]);
    },
  });
}

export function useMutationUpdateProjectRating(projectId: ProjectId) {
  const queryClient = useQueryClient();
  return useMutation(updateProjectRating, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(["project", projectId, "rating"]);
    },
  });
}

export function resetProjectStatus(
  projectId: ProjectId,
  status: ProjectStatus
) {
  return putProjectStatus(projectId, status);
}
