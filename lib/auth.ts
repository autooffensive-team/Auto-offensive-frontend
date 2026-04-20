import "server-only";

import { betterAuth } from "better-auth";
import { toNextJsHandler, nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";

import { isProduction, readOptionalEnv, readRequiredEnv } from "@/lib/server-env";

const appUrl = readOptionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
const keycloakIssuer = readRequiredEnv("KEYCLOAK_ISSUER");

export const auth = betterAuth({
  appName: "Auto Offensive",
  baseURL: appUrl,
  basePath: "/api/auth",
  secret: readRequiredEnv("BETTER_AUTH_SECRET"),
  trustedOrigins: [appUrl],
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "keycloak",
          clientId: readRequiredEnv("KEYCLOAK_WEB_CLIENT_ID"),
          clientSecret: readRequiredEnv("KEYCLOAK_WEB_CLIENT_SECRET"),
          issuer: keycloakIssuer,
          requireIssuerValidation: true,
          authorizationUrl: `${keycloakIssuer}/protocol/openid-connect/auth`,
          tokenUrl: `${keycloakIssuer}/protocol/openid-connect/token`,
          userInfoUrl: `${keycloakIssuer}/protocol/openid-connect/userinfo`,
          scopes: ["openid", "profile", "email"],
          pkce: true,
        },
      ],
    }),
    nextCookies(),
  ],
  advanced: {
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    },
  },
});

export const authRouteHandlers = toNextJsHandler(auth);
