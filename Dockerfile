FROM node:22-bookworm-slim AS build

RUN apt-get update \
  && apt-get install --yes --no-install-recommends ca-certificates git git-lfs \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /source

# Railway's build context contains an LFS pointer for the installer. Clone the
# public repository with Git LFS so the runtime image receives the real binary.
ARG RAILWAY_GIT_COMMIT_SHA
RUN echo "Building Railway commit: ${RAILWAY_GIT_COMMIT_SHA}" \
  && git lfs install \
  && git clone --depth 1 https://github.com/takaki19999/portofolio.git . \
  && git lfs pull

WORKDIR /source/portofolio

RUN npm ci
RUN NITRO_PRESET=node-server npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /source/portofolio/.output ./.output
COPY --from=build /source/portofolio/node_modules ./node_modules

CMD ["node", ".output/server/index.mjs"]
