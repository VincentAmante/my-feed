import { z } from "zod";
import type { User as ClerkUser } from '@clerk/nextjs/server'
import { clerkClient } from "@clerk/nextjs/server";
import { Post, Feed } from "@prisma/client";


import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
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
  getUserFeeds: privateProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.userId;
      const ownedFeeds = await ctx.prisma.feed.findMany({
        where: {
          ownerId: userId,
        },
      });

      const subscribedFeeds = await ctx.prisma.feed.findMany({
        where: {
          FeedFollower: {
            some: {
              userId: userId,
            },
          },
        },
      });
      return [...ownedFeeds, ...subscribedFeeds] as Feed[];
    }),
  
  getUnfollowedSpaces: privateProcedure
    .input(z.object({ feedId: z.string() }))
    .query(async ({ input, ctx }) => {
      const unownedFeeds = await ctx.prisma.space.findMany({
        where: {
          SpaceInFeed: {
            none: {
              feedId: input.feedId,
            }
          },
        },
        take: 6,
      })

      return unownedFeeds;
    }),

  
  getSpacesByFeedId: publicProcedure
    .input(z.object({ feedId: z.string() }))
    .query(async ({ input, ctx }) => {
      const spaces = await ctx.prisma.spaceInFeed.findMany({
        where: {
          feedId: input.feedId,
        },
        include: {
          space: true
        },
      });

      return spaces.map((space) => space.space);
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
                createdAt: "asc",
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
                createdAt: "asc",
              }
            }
          },
          where: {
            Space: {
              SpaceInFeed: {
                some: {
                  feedId: input.feedId,
                }
              },
            }
          }
        }
        );
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

  createFeed: privateProcedure
    .input(
      z.object({
        name: z.string().min(1).max(64),
        visibility: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;

      return await ctx.prisma.feed.create({
        data: {
          name: input.name,
          visibility: input.visibility,
          ownerId: userId
        },
      });
    }),
  
  getFeedById: publicProcedure
    .input(z.object({ feedId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.feed.findUnique({
        where: {
          id: input.feedId,
        },
      });
    }
  ),

  updateFeed: publicProcedure
    .input(
      z.object({
        feedId: z.string(),
        name: z.string().min(1).max(64),
        visibility: z.string(),
      })
  )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.feed.update({
        where: {
          id: input.feedId,
        },
        data: {
          name: input.name,
          visibility: input.visibility,
        },
      });
    }
  ),

  deleteFeed: publicProcedure
    .input(z.object({ feedId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.feed.delete({
        where: {
          id: input.feedId,
        },
      });
    }
  ),

  addSpaceToFeed: privateProcedure
    .input(
      z.object({
        feedId: z.string(),
        spaceId: z.string(),
      })
  )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.spaceInFeed.create({
        data: {
          feedId: input.feedId,
          spaceId: input.spaceId,
        },
      });
    }
  ),

  removeSpaceFromFeed: privateProcedure
    .input(
      z.object({
        feedId: z.string(),
        spaceId: z.string(),
      })
  )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.spaceInFeed.deleteMany({
        where: {
          feedId: input.feedId,
          spaceId: input.spaceId,
        },
      });
    }
  ),
});
