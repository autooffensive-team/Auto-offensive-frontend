import { generateMetadata } from "@/lib/metadata";
import { readOptionalEnv, readRequiredEnv } from "@/lib/server-env";
import {
  type Category,
  type CategoryListResponse,
} from "@/lib/redux/services/tools-list/category-list";
import {
  type Tool,
  type FetchToolsResponse,
} from "@/lib/redux/services/tools-list/tools-list";

export const metadata = generateMetadata({
  title: "Pentesting Tools",
  description:
    "Discover the Auto-Offensive tool library with reconnaissance, scanning, and vulnerability assessment workflows designed for fast security testing.",
  image: "/Auto-Offensive.webp",
  url: "/tools",
});

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
          (example): example is string =>
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

function normalizeCategory(category: Partial<Category>): Category {
  return {
    category_id: category.category_id ?? "",
    name: category.name ?? "",
    description: category.description ?? "",
    created_at: category.created_at ?? "",
    last_modified: category.last_modified ?? "",
  };
}

async function fetchServerData(): Promise<{
  categories: Category[];
  tools: Tool[];
}> {
  const gatewayBaseUrl =
    readOptionalEnv("BACKEND_URL", "") ||
    readRequiredEnv("FASTAPI_GATEWAY_URL");

  const baseUrl = gatewayBaseUrl.replace(/\/$/, "");

  try {
    const [catsRes, toolsRes] = await Promise.allSettled([
      fetch(`${baseUrl}/categories`, {
        headers: { accept: "application/json" },
        next: { revalidate: 60 },
      }),
      fetch(`${baseUrl}/tools?active_only=false`, {
        headers: { accept: "application/json" },
        next: { revalidate: 60 },
      }),
    ]);

    let categories: Category[] = [];
    let tools: Tool[] = [];

    if (catsRes.status === "fulfilled" && catsRes.value.ok) {
      const data = (await catsRes.value.json()) as
        | CategoryListResponse
        | Category[];
      const raw = Array.isArray(data) ? data : (data.categories ?? []);
      categories = raw.map(normalizeCategory);
    }

    if (toolsRes.status === "fulfilled" && toolsRes.value.ok) {
      const data = (await toolsRes.value.json()) as
        | FetchToolsResponse
        | Tool[];
      const raw = Array.isArray(data) ? data : (data.tools ?? []);
      tools = raw.map(normalizeTool);
    }

    return { categories, tools };
  } catch {
    return { categories: [], tools: [] };
  }
}

export default async function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { categories, tools } = await fetchServerData();

  // Pass server-fetched data to the client page via a script tag
  // This avoids the client-side fetch waterfall
  return (
    <>
      <script
        id="tools-server-data"
        type="application/json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ categories, tools }),
        }}
      />
      {children}
    </>
  );
}
