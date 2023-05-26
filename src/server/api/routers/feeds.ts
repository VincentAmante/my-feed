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
      return await ctx.prisma.post.findMany({
        where: {
          feedId: input.feedId,
        },
      });
    }),

  getGlobalPosts: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.post.findMany({
      take: 10,
      where: {
        Feed: {
          visibility: "public",
        },
      },
    });
  }),

  continueGlobalPosts: publicProcedure
    .input(z.object({ pageOffset: z.number() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.post.findMany({
        skip: input.pageOffset * 10,
        take: 10,
        where: {
          Feed: {
            visibility: "public",
          },
        },
      });
    }),

  createFeed: publicProcedure
    .input(
      z.object({
        name: z.string(),
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
