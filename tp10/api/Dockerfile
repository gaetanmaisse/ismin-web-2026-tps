# TODO step 2. The image of the API, in one stage:
#
#   FROM     the official Node 26 image, its alpine variant
#   WORKDIR  /app
#   COPY     package.json, package-lock.json, prisma.config.ts and
#            prisma/schema.prisma, then RUN npm ci. The dependencies before
#            the code: this layer stays in the cache as long as they do not
#            change. The schema with them: the postinstall of package.json
#            runs `prisma generate`, which reads it.
#   COPY     the rest of the code, then RUN npm run build
#   CMD      node dist/main.js: the compiled code, not the development server
#
# TODO step 3. Two stages. The first one, named `build`, compiles. The final
# one starts again from an empty Node image and only keeps what runs: the
# production dependencies, and the dist/ of `build`. Both run as `node`, and
# both create the folder of the database file, owned by `node`.
