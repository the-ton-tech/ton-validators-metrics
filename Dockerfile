FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@8.15.1 --activate

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=monitoring --prod /prod/monitoring

FROM base AS app1
COPY --from=build /prod/monitoring /prod/monitoring
WORKDIR /prod/monitoring/apps/monitoring
EXPOSE 8000
CMD [ "pnpm", "start" ]

