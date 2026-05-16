import { baseApi } from "@/lib/redux/services/base-api";
import type {
  CreateProjectRequest,
  DeleteProjectRequest,
  ProjectListResponse,
  RawProject,
  UpdateProjectRequest,
  UserProject,
} from "@/types/project";

export type { UserProject } from "@/types/project";

function normalizeProject(project: RawProject): UserProject {
  return {
    project_id: project.project_id ?? project.id ?? "",
    name: project.name ?? "",
    description: project.description ?? "",
    owner_id: project.owner_id ?? project.owner ?? "",
    created_at: project.created_at ?? "",
    last_modified:
      project.last_modified ?? project.last_scan_at ?? project.created_at ?? "",
  };
}

function normalizeProjectList(response: ProjectListResponse): UserProject[] {
  const projects = Array.isArray(response)
    ? response
    : (response.projects ?? []);
  return projects.map(normalizeProject);
}

async function parseProjectResponse(response: Response): Promise<RawProject> {
  const text = await response.text();
  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as RawProject;
  } catch {
    return {};
  }
}

export const projectApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProjects: builder.query<UserProject[], void>({
      query: () => "projects",
      transformResponse: (response: ProjectListResponse) =>
        normalizeProjectList(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map((project) => ({
                type: "Project" as const,
                id: project.project_id,
              })),
              { type: "Project" as const, id: "LIST" },
            ]
          : [{ type: "Project" as const, id: "LIST" }],
    }),
    getProjectById: builder.query<UserProject, string>({
      query: (projectId) => `projects/${projectId}`,
      transformResponse: (response: RawProject) => normalizeProject(response),
      providesTags: (_result, _error, projectId) => [
        { type: "Project", id: projectId },
      ],
    }),
    createProject: builder.mutation<UserProject, CreateProjectRequest>({
      query: (body) => ({
        url: "projects",
        method: "POST",
        body,
        responseHandler: parseProjectResponse,
      }),
      transformResponse: (response: RawProject) => normalizeProject(response),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
    updateProject: builder.mutation<UserProject, UpdateProjectRequest>({
      query: ({ project_id, ...body }) => ({
        url: `projects/${project_id}`,
        method: "PATCH",
        body,
        responseHandler: parseProjectResponse,
      }),
      transformResponse: (response: RawProject) => normalizeProject(response),
      invalidatesTags: (_result, _error, { project_id }) => [
        { type: "Project", id: project_id },
        { type: "Project", id: "LIST" },
      ],
    }),
    deleteProject: builder.mutation<void, DeleteProjectRequest>({
      query: ({ project_id, cascade = true }) => ({
        url: `projects/${project_id}`,
        method: "DELETE",
        params: { cascade },
      }),
      invalidatesTags: (_result, _error, { project_id }) => [
        { type: "Project", id: project_id },
        { type: "Project", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
