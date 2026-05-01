import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/backend",
    credentials: "include",
  }),
  tagTypes: ["Auth", "Gateway"],
  endpoints: () => ({}),
});
