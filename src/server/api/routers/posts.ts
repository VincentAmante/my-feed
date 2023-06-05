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

  likeUnlikePost: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;
      const postId = input.postId;

      const isLiked = await ctx.prisma.post.findFirst({
        where: {
          id: postId,
          likedByIDs: {
            hasEvery: [userId],
          }
        },
      });

      if (isLiked) {
        await ctx.prisma.post.update({
          where: {
            id: postId,
          },
          data: {
            likedByIDs: {
              // Filters out the userId from the likedByIDs array
              // Done because there is no way to remove an element from an array in Prisma
              set: isLiked.likedByIDs.filter((id) => id !== userId),
            },
          },
        });
      }
    })
});
