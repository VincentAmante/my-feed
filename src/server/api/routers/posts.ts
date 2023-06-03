import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const postsRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(280),
        image: z.string(),
        spaceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const authorId = ctx.userId;

      return await ctx.prisma.post.create({
        data: {
          content: input.content,
          image: input.image,
          authorId,
          spaceId: input.spaceId,
        },
      });
    }),
  
  deletePost: privateProcedure
    .input(
      z.object({
        postId: z.string(),
        })
    )
    .mutation(async ({ input, ctx }) => {
      const authorId = ctx.userId;
      return await ctx.prisma.post.deleteMany({
        where: {
          id: input.postId,
          authorId,
        },
      });
    }
  ),
});
