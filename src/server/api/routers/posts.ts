import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const postsRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(280),
        images: z.array(z.string()),
        spaceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Doing it this way ensures the data is attached to
      // the logged-in user
      const authorId = ctx.userId;

      return await ctx.prisma.post.create({
        data: {
          content: input.content,
          images: input.images,
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

  createComment: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(280),
        postId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const authorId = ctx.userId;
      const postId = input.postId;

      return await ctx.prisma.comment.create({
        data: {
          content: input.content,
          authorId,
          postId,
        },
      });
    }),

  updateComment: privateProcedure
    .input(
      z.object({
        commentId: z.string(),
        content: z.string().min(1).max(280),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const authorId = ctx.userId;
      const commentId = input.commentId;

      return await ctx.prisma.comment.updateMany({
        where: {
          id: commentId,
          authorId,
        },
        data: {
          content: input.content,
        },
      });
    }),


  deleteComment: privateProcedure
    .input(
      z.object({
        commentId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const authorId = ctx.userId;
      return await ctx.prisma.comment.deleteMany({
        where: {
          id: input.commentId,
          authorId,
        },
      });
    }),

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

      if (!isLiked) {
        await ctx.prisma.post.update({
          where: {
            id: postId,
          },
          data: {
            likedByIDs: {
              push: userId,
            },
          },
        });
      }
    }),

  enforceUniqueLikes: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const postId = input.postId;
      const isLiked = await ctx.prisma.post.findFirst({
        where: {
          id: postId,
        },
      });

      if (isLiked) {
        await ctx.prisma.post.update({
          where: {
            id: postId,
          },
          data: {
            likedByIDs: {
              set: [...new Set(isLiked.likedByIDs)],
            },
          },
        });
      }
    }),
});
