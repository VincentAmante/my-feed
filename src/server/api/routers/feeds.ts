import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const feedsRouter = createTRPCRouter({
  getUserFeeds: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.feed.findMany({
        where: {
          ownerId: input.userId,
        },
      });
    }),

  getFeedPostsById: publicProcedure
    .input(z.object({ feedId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (input.feedId === "global") {
        return await ctx.prisma.post.findMany({
          where: {
            Space: {
              visibility: "public",
              softDeleted: false,
            }
          }
        });
      } else {
        return await ctx.prisma.post.findMany({
          where: {
            Space: {
              id: input.feedId,
              softDeleted: false,
            },
          },
        });
      }
    }),

  createFeed: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(64),
        visibility: z.string(),
        ownerId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.feed.create({
        data: {
          name: input.name,
          visibility: input.visibility,
          ownerId: input.ownerId,
        },
      });
    }),
});
