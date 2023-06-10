import z from "zod";
import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { type User, clerkClient } from "@clerk/nextjs/server";
import { filterUserForClient } from "../../helpers/filterUserForClient";
import { privateDecrypt } from "crypto";

// For creating spaces
function addPossessiveSuffix(name: string): string {
  if (name.endsWith('s') || name.endsWith('S')) {
    return `${name}'`;
  }
  return `${name}'s`;
}

export const usersRouter = createTRPCRouter({
  initUser: publicProcedure
    .input(z.object({
      clerkId: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      username: z.string(),
    }))
    .query(async ({ input, ctx }) => {

      // Clause guard
      if (input.clerkId === "") return null;

      const doesUserExist = await ctx.prisma.user.findMany({
        where: {
          clerkId: input.clerkId,
        },
      });

      if (doesUserExist.length < 1) {
        const userInfo: User[] = await clerkClient.users.getUserList({
          userId: [input.clerkId],
          limit: 5,
        });

        if (userInfo.length < 1) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User not found",
          });
        }
        const clerkUser = userInfo[0];

        if (clerkUser?.username === undefined || clerkUser?.username === null) throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Username not found",
        });

        const username = clerkUser.username;

        const user = await ctx.prisma.user.create({
          data: {
            clerkId: input.clerkId,
            displayName: username,
          },
        });

        const firstSpaceName = (input.firstName) ? addPossessiveSuffix(input.firstName) : addPossessiveSuffix(input.username);

        await ctx.prisma.space.create({
          data: {
            name: `${firstSpaceName} Space`,
            ownerId: input.clerkId,
          },
        });

        return user;

      } else {
        return doesUserExist[0];
      }
    }),

  verifyUserExists: publicProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ input, ctx }) => {
      const doesUserExist = await ctx.prisma.user.findMany({
        where: {
          clerkId: input.clerkId,
        },
      });
      const isUserInClerk = await clerkClient.users.getUserList({
        userId: [input.clerkId],
        limit: 5,
      });

      if (isUserInClerk.length == 0) {
        if (doesUserExist.length == 0) {
          await ctx.prisma.user.deleteMany({
            where: {
              clerkId: input.clerkId,
            },
          });
        }

        return false;
      } else {

        return true;
      }
    }),

  getCurrentUser: privateProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      const userId = ctx.userId;
      const user = await clerkClient.users.getUser(userId);
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }
      return filterUserForClient(user);
    }),

  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        const users = (
          await clerkClient.users.getUserList({
            limit: 200,
          })
        )

        const user = users.find((user) => user.username === input.username);
        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User not found",
          });
        }
        return filterUserForClient(user)
      }
      return filterUserForClient(user);

    }),
});
