import { baseApi } from "@/lib/redux/services/base-api";

export type ToolExample = string;

export interface ScanPreset {
  name: string;
  description: string;
  flags?: string[];
}

export interface ScanOption {
  flag: string;
  key: string;
  type: string;
  description: string;
}

export interface Tool {
  tool_id: string;
  tool_name: string;
  tool_description: string;
  tool_long_description: string;
  category_name: string;
  is_active: boolean;
  image_ref: string | null;
  version: string | null;
  install_method: string | null;
  examples: ToolExample[];
  scan_config: {
    basic: {
      presets: ScanPreset[];
    };
    medium: {
      options: ScanOption[];
    };
    advanced: {
      options: ScanOption[];
    };
  };
  created_at: string;
  updated_at: string;
}

export interface FetchToolsResponse {
  tools?: Tool[];
}

function normalizeTool(tool: Partial<Tool>): Tool {
  return {
    tool_id: tool.tool_id ?? "",
    tool_name: tool.tool_name ?? "",
    tool_description: tool.tool_description ?? "",
    tool_long_description: tool.tool_long_description ?? "",
    category_name: tool.category_name ?? "",
    is_active: Boolean(tool.is_active),
    image_ref: tool.image_ref ?? null,
    version: tool.version ?? null,
    install_method: tool.install_method ?? null,
    examples: Array.isArray(tool.examples)
      ? tool.examples.filter(
          (example): example is ToolExample =>
            typeof example === "string" && example.trim().length > 0,
        )
      : [],
    scan_config: {
      basic: {
        presets: Array.isArray(tool.scan_config?.basic?.presets)
          ? tool.scan_config.basic.presets
          : [],
      },
      medium: {
        options: Array.isArray(tool.scan_config?.medium?.options)
          ? tool.scan_config.medium.options
          : [],
      },
      advanced: {
        options: Array.isArray(tool.scan_config?.advanced?.options)
          ? tool.scan_config.advanced.options
          : [],
      },
    },
    created_at: tool.created_at ?? "",
    updated_at: tool.updated_at ?? "",
  };
}

function normalizeToolList(response: FetchToolsResponse | Tool[]): Tool[] {
  const tools = Array.isArray(response) ? response : (response.tools ?? []);
  return tools.map(normalizeTool);
}

export const toolsListApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTools: builder.query<Tool[], boolean | void>({
      query: (activeOnly = false) => ({
        url: "tools",
        params: { active_only: activeOnly },
      }),
      transformResponse: (response: FetchToolsResponse | Tool[]) =>
        normalizeToolList(response),
    }),
    getToolById: builder.query<Tool, string>({
      query: (toolId) => `tools/${toolId}`,
      transformResponse: (response: Tool) => normalizeTool(response),
    }),
  }),
});

export const { useGetToolsQuery, useGetToolByIdQuery } = toolsListApi;

export async function fetchTools(activeOnly = false): Promise<Tool[]> {
  const response = await fetch(`/api/backend/tools?active_only=${activeOnly}`, {
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tools: ${response.status}`);
  }

  const data = (await response.json()) as FetchToolsResponse | Tool[];
  return normalizeToolList(data);
}

export async function fetchToolById(toolId: string): Promise<Tool | null> {
  const response = await fetch(`/api/backend/tools/${toolId}`, {
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch tool: ${response.status}`);
  }

  const data = (await response.json()) as Tool;
  return normalizeTool(data);
}

export async function fetchToolsByCategory(categoryName: string): Promise<Tool[]> {
  const tools = await fetchTools(false);
  return tools.filter((tool) => tool.category_name === categoryName);
}

export function groupToolsByCategory(tools: Tool[]): Record<string, Tool[]> {
  return tools.reduce(
    (grouped, tool) => {
      if (!grouped[tool.category_name]) {
        grouped[tool.category_name] = [];
      }
      grouped[tool.category_name].push(tool);
      return grouped;
    },
    {} as Record<string, Tool[]>,
  );
}

export function sortToolsByName(tools: Tool[]): Tool[] {
  return [...tools].sort((a, b) => a.tool_name.localeCompare(b.tool_name));
}

export function filterToolsByStatus(tools: Tool[], active = true): Tool[] {
  return tools.filter((tool) => tool.is_active === active);
}

export function getToolStats(tools: Tool[]) {
  const byCategory = groupToolsByCategory(tools);
  const activeCount = tools.filter((tool) => tool.is_active).length;

  return {
    totalTools: tools.length,
    activeTools: activeCount,
    inactiveTools: tools.length - activeCount,
    categories: Object.keys(byCategory),
    toolsPerCategory: Object.entries(byCategory).map(([category, categoryTools]) => ({
      category,
      count: categoryTools.length,
    })),
  };
}

export function searchTools(tools: Tool[], query: string): Tool[] {
  const lowercaseQuery = query.toLowerCase();
  return tools.filter((tool) =>
    tool.tool_name.toLowerCase().includes(lowercaseQuery) ||
    tool.tool_description.toLowerCase().includes(lowercaseQuery) ||
    tool.tool_long_description.toLowerCase().includes(lowercaseQuery),
  );
}
