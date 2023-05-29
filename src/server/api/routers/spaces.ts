import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const spacesRouter = createTRPCRouter({
  getSpaceById: publicProcedure
    .input(
      z.object({
        spaceId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.space.findUnique({
        where: {
          id: input.spaceId,
        },
      });
    }),

  getSpacePostsById: publicProcedure
    .input(
      z.object({
        spaceId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.post.findMany({
        where: {
          spaceId: input.spaceId,
        },
      });
    }),

  getSpacesByUserId: publicProcedure
    .input(
      z.object({
        ownerId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.space.findMany({
        where: {
          ownerId: input.ownerId,
          softDeleted: false,
        },
        select: {
          id: true,
          name: true,
          ownerId: true,
        },
      });
    }),
});
