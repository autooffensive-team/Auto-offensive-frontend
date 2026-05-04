import { baseApi } from "@/lib/redux/services/base-api";

export interface Category {
  category_id: string;
  name: string;
  description: string;
  created_at: string;
  last_modified: string;
}

export interface CategoryListResponse {
  categories?: Category[];
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

function normalizeCategoryList(response: CategoryListResponse | Category[]): Category[] {
  const categories = Array.isArray(response)
    ? response
    : (response.categories ?? []);

  return categories.map(normalizeCategory);
}

export const categoryListApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => "categories",
      transformResponse: (response: CategoryListResponse | Category[]) =>
        normalizeCategoryList(response),
    }),
  }),
});

export const { useGetCategoriesQuery } = categoryListApi;

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/backend/categories", {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const data = (await response.json()) as CategoryListResponse | Category[];
  return normalizeCategoryList(data);
}
