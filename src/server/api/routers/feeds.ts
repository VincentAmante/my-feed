import { z } from "zod";
import type { User as ClerkUser } from '@clerk/nextjs/server'
import { clerkClient } from "@clerk/nextjs/server";
import { Post } from "@prisma/client";


import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import Comment from './../../../components/Comment';
const filterUserForClient = (user: ClerkUser) => {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
  }
}

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
      let posts = null;
      if (input.feedId === "global") {
        posts = await ctx.prisma.post.findMany({
          orderBy: {
            createdAt: "desc",
          },
          include: {
            Space: {
              select: {
                name: true,
              }
            },
            Comment: {
              take: 3,
              orderBy: {
                createdAt: "desc",
              }
            }
          },
          where: {
            Space: {
              visibility: "public",
              softDeleted: false,
            },
          },
          take: 12,
        });
      } else {
        posts = await ctx.prisma.post.findMany({
          orderBy: {
            createdAt: "desc",
          },
          include: {
            Space: {
              select: {
                name: true,
              }
            },
            Comment: {
              take: 3,
              orderBy: {
                createdAt: "desc",
              }
            }
          },
          where: {
            Space: {
              id: input.feedId,
              softDeleted: false,
            },
          },
        });
      }

      const users = (
        await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100
        }))
        .map(filterUserForClient)
      
      // Maps users to comments
      const userComments = (
        await clerkClient.users.getUserList({
        userId: posts.flatMap((post) => post.Comment.map((comment) => comment.authorId)),
          limit: 3
        }))
        .map(filterUserForClient)
          

      // includes the author and comments in the post
      return posts.map((post) => ({
        ...post,
        author: users.find((user) => user.id === post.authorId),
        comments: post.Comment.map((comment) => ({
          ...comment,
          author: userComments.find((user) => user.id === comment.authorId),
        })),
        
        // removed so I don't accidentally use it
        Comment: undefined,
      }));
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
