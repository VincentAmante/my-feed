import type { User as ClerkUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: ClerkUser) => {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
  }
}

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
      const posts = await ctx.prisma.post.findMany({
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
              createdAt: "asc",
            }
          }
        },
        where: {
          spaceId: input.spaceId,
        },
      });
      
      const users = (
        await clerkClient.users.getUserList({
          userId: posts.map((post) => post.authorId),
          limit: 100
        }))
        .map(filterUserForClient)
      
      const userComments = (
        await clerkClient.users.getUserList({
          userId: posts.flatMap((post) => post.Comment.map((comment) => comment.authorId)),
          limit: 3
        }))
        .map(filterUserForClient)
            

      return posts.map((post) => ({
        ...post,
        author: users.find((user) => user.id === post.authorId),
        comments: post.Comment.map((comment) => ({
          ...comment,
          author: userComments.find((user) => user.id === comment.authorId),
        })),
        Comment: undefined,
      }));
    }),

  getSpacesByUserId: publicProcedure
    .input(
      z.object({
        ownerId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.space.findMany({
        take: 100,
        where: {
          ownerId: input.ownerId,
          softDeleted: false,
        },
        select: {
          id: true,
          name: true,
          ownerId: true,
        }
      });
    }),
  
  createSpace: privateProcedure
    .input(
      z.object({
        name: z.string(),
        visibility: z.enum(["public", "private", "obscure", "protected"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;

      return await ctx.prisma.space.create({
        data: {
          name: input.name,
          visibility: input.visibility,
          ownerId: userId,
        }
      });
    }),
  

  updateSpace: privateProcedure
    .input(
      z.object({
        spaceId: z.string(),
        name: z.string(),
        visibility: z.enum(["public", "private", "obscure", "protected"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;
      const space = await ctx.prisma.space.updateMany({
        where: {
          id: input.spaceId,
          ownerId: userId,
        },
        data: {
          name: input.name,
          visibility: input.visibility,
        }
      });
      return space;
    }),
  
  deleteSpace: privateProcedure
    .input(
      z.object({
        spaceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;
      const space = await ctx.prisma.space.deleteMany({
        where: {
          id: input.spaceId,
          ownerId: userId,
        }
      });
      return space;
    })
});
