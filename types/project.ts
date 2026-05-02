export type UserProject = {
  project_id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  last_modified: string;
};

export type CreateProjectRequest = {
  name: string;
  description: string;
};

export type UpdateProjectRequest = {
  project_id: string;
  name?: string;
  description?: string;
};

export type DeleteProjectRequest = {
  project_id: string;
  cascade?: boolean;
};

export type RawProject = Partial<UserProject> & {
  id?: string;
  owner?: string;
  scan_count?: number;
  last_scan_at?: string;
};

export type ProjectListResponse = UserProject[] | { projects?: RawProject[] };