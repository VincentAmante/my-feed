import { z } from "zod";
import type { User as ClerkUser } from '@clerk/nextjs/server'
import { clerkClient } from "@clerk/nextjs/server";
import { Post, Feed } from "@prisma/client";


import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
import { icon } from "@fortawesome/fontawesome-svg-core";
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
          OR: [
            {

              ownerId: userId,
            },
            {
              FeedFollower: {
                some: {
                  userId: userId,
                },
              },
            }
          ]
        },
      });

      return ownedFeeds;
    }),



  getProfileFeeds: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const feeds = await ctx.prisma.feed.findMany({
        where: {
          ownerId: input.userId,
          OR: [
            {
              visibility: "public",
            },
            {
              visibility: "obscure",
            }
          ]
        },
      });
      return feeds;
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
          visibility: "public",
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

  getInfiniteFeedPostsById: publicProcedure
    .input(z.object({ feedId: z.string(), cursor: z.string().nullish(), limit: z.number().default(12) }))
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
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
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
              softDeleted: false,
            }
          },
          take: 12 + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
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



      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > input.limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.id;
      }

      // includes the author and comments in the post
      const postsWithUsers = posts.map((post) => ({
        ...post,
        author: users.find((user) => user.id === post.authorId),
        comments: post.Comment.map((comment) => ({
          ...comment,
          author: userComments.find((user) => user.id === comment.authorId),
        })),

        // removed so I don't accidentally use it
        Comment: undefined,
      }));

      return {
        posts: postsWithUsers.slice(0, input.limit),
        nextCursor,
      }
    }),

  createFeed: privateProcedure
    .input(
      z.object({
        name: z.string().min(1).max(86),
        visibility: z.string(),
        icon: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;

      return await ctx.prisma.feed.create({
        data: {
          name: input.name,
          visibility: input.visibility,
          ownerId: userId,
          icon: input.icon
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
        icon: z.string().optional().nullable(),
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
          icon: input.icon
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

  subscribeToFeed: privateProcedure
    .input(
      z.object({
        feedId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;
      await ctx.prisma.feedFollower.create({
        data: {
          feedId: input.feedId,
          userId: userId,
        },
      });
    }),

  unsubscribeFromFeed: privateProcedure
    .input(
      z.object({
        feedId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;
      await ctx.prisma.feedFollower.deleteMany({
        where: {
          feedId: input.feedId,
          userId: userId,
        },
      });
    }
    ),

  isUserSubscribedToFeed: privateProcedure
    .input(
      z.object({
        feedId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (input.feedId === "global") return true; // everyone is subscribed to global feed
      const userId = ctx.userId;
      const feedFollower = await ctx.prisma.feedFollower.findFirst({
        where: {
          feedId: input.feedId,
          userId: userId,
        },
      });
      return feedFollower !== null;
    }
    ),
});
