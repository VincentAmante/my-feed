import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postsRouter = createTRPCRouter({
  createPost: publicProcedure
    .input(
      z.object({
        content: z.string().min(1).max(280),
        image: z.string(),
        authorId: z.string(),
        feedId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.post.create({
        data: {
          content: input.content,
          image: input.image,
          authorId: input.authorId,
          feedId: input.feedId,
        },
      });
    }),
});
