import type { AuthMeResponse } from "@/types/auth";
import { baseApi } from "@/lib/redux/services/base-api";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuthMe: builder.query<AuthMeResponse, void>({
      query: () => "auth/me",
      providesTags: [{ type: "Auth", id: "ME" }],
    }),
    updateUserProfileImage: builder.mutation<Record<string, unknown>, FormData>({
      query: (body) => ({
        url: "users/me/profile-image",
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "Auth", id: "ME" }],
    }),
  }),
});

export const { useGetAuthMeQuery, useUpdateUserProfileImageMutation } = authApi;
