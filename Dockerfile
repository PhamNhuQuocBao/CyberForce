# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY services/api-core/package.json services/api-core/package.json
RUN HUSKY=0 pnpm install --frozen-lockfile

FROM dependencies AS api
COPY tsconfig.base.json ./
COPY services/api-core services/api-core
RUN pnpm --filter @cyberforce/api-core exec prisma generate && pnpm --filter @cyberforce/api-core build
WORKDIR /app/services/api-core
USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]

FROM dependencies AS web-build
COPY tsconfig.base.json ./
COPY apps/web apps/web
COPY eslint.config.mjs ./
RUN mkdir -p apps/web/public
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @cyberforce/web build

FROM node:22-bookworm-slim AS web
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=web-build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=web-build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=web-build --chown=node:node /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
