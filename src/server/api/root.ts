import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { feedsRouter } from "~/server/api/routers/feeds";
import { postsRouter } from "~/server/api/routers/posts";
import { usersRouter } from "~/server/api/routers/users";
import { spacesRouter } from "~/server/api/routers/spaces";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  feeds: feedsRouter,
  posts: postsRouter,
  users: usersRouter,
  spaces: spacesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
