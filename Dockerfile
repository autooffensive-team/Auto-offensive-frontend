# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS base

# ── Dependencies ─────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ── Builder ──────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (NEXT_PUBLIC_* must be present at build time)
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_DOCS_APP_URL
ARG DOCS_APP_URL
ARG BACKEND_URL
ARG FASTAPI_GATEWAY_URL
ARG KEYCLOAK_ISSUER
ARG BETTER_AUTH_SECRET
ARG KEYCLOAK_WEB_CLIENT_ID
ARG KEYCLOAK_WEB_CLIENT_SECRET
ARG NEXT_PUBLIC_EMAILJS_SERVICE_ID
ARG NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
ARG NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_DOCS_APP_URL=${NEXT_PUBLIC_DOCS_APP_URL}
ENV DOCS_APP_URL=${DOCS_APP_URL}
ENV BACKEND_URL=${BACKEND_URL}
ENV FASTAPI_GATEWAY_URL=${FASTAPI_GATEWAY_URL}
ENV KEYCLOAK_ISSUER=${KEYCLOAK_ISSUER}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV KEYCLOAK_WEB_CLIENT_ID=${KEYCLOAK_WEB_CLIENT_ID}
ENV KEYCLOAK_WEB_CLIENT_SECRET=${KEYCLOAK_WEB_CLIENT_SECRET}
ENV NEXT_PUBLIC_EMAILJS_SERVICE_ID=${NEXT_PUBLIC_EMAILJS_SERVICE_ID}
ENV NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=${NEXT_PUBLIC_EMAILJS_TEMPLATE_ID}
ENV NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=${NEXT_PUBLIC_EMAILJS_PUBLIC_KEY}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM base AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
