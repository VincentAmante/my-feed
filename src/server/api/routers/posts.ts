import { z } from "zod";

import { clerkClient } from "@clerk/nextjs";
import { createTRPCRouter, privateProcedure, publicProcedure, } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import { TRPCError } from "@trpc/server";

export const postsRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(280).trim(),
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
        content: z.string().min(1).max(280).trim(),
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
    }
    ),

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

  getPostById: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const postId = input.postId;

      const post = await ctx.prisma.post.findFirst({
        where: {
          id: postId,
        },
        include: {
          Space: true,
        },
      });

      if (!post) {
        // throw new TRPCError({
        //   code: "NOT_FOUND",
        //   message: "Post not found",
        // });
        return null;
      }

      const user = await clerkClient.users.getUser(post.authorId);
      const postWithUser = {
        ...post,
        author: filterUserForClient(user),
      };
      return postWithUser;
    }),


  getInfiniteComments: privateProcedure
    .input(
      z.object({
        postId: z.string(),
        cursor: z.string().nullish(),
        limit: z.number().optional().default(4),
      })
    )
    .query(async ({ input, ctx }) => {
      const postId = input.postId;
      const cursor = input.cursor;

      const comments = await ctx.prisma.comment.findMany({
        where: {
          postId,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: input.limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: comments.map((post) => post.authorId),
          limit: 100
        }))
        .map(filterUserForClient)

      const commentsWithUsers = comments.map((comment) => {
        const user = users.find((user) => user.id === comment.authorId);
        return {
          ...comment,
          author: user,
        };
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (commentsWithUsers.length > input.limit) {
        const nextComment = commentsWithUsers.pop();
        nextCursor = nextComment?.id;
      }

      return {
        comments: commentsWithUsers.slice(0, input.limit),
        nextCursor,
      };
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
