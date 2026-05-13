import type { AuthMeResponse } from "@/types/auth";
import { baseApi } from "@/lib/redux/services/base-api";

type UpdateMyUserRequest = {
  alias_name: string;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuthMe: builder.query<AuthMeResponse, void>({
      query: () => "auth/me",
      providesTags: [{ type: "Auth", id: "ME" }],
    }),
    updateMyUser: builder.mutation<Record<string, unknown>, UpdateMyUserRequest>({
      query: (body) => ({
        url: "users/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Auth", id: "ME" }],
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

export const {
  useGetAuthMeQuery,
  useUpdateMyUserMutation,
  useUpdateUserProfileImageMutation,
} = authApi;
