FROM node:22-bookworm-slim AS build

WORKDIR /app

# Railway checks out the repository before building. Use that checkout rather
# than cloning from GitHub again, which would require repository credentials.
COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN NITRO_PRESET=node-server npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules

CMD ["node", ".output/server/index.mjs"]
