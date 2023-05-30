import { z } from "zod";
import type { User as ClerkUser } from '@clerk/nextjs/server'
import { clerkClient } from "@clerk/nextjs/server";
import { Post } from "@prisma/client";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


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
          where: {
            Space: {
              visibility: "public",
              softDeleted: false,
            }
          }
        });
      } else {
        posts = await ctx.prisma.post.findMany({
          orderBy: {
            createdAt: "desc",
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

      return posts.map((post) => ({
        ...post,
        author: users.find((user) => user.id === post.authorId)
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
