import z from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";

export const usersRouter = createTRPCRouter({
  initUser: publicProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ input, ctx }) => {

        // Clause guard
        if (input.clerkId === "") return null;

      const doesUserExist = await ctx.prisma.user.findMany({
        where: {
          clerkId: input.clerkId,
        },
      });

      if (!doesUserExist.length) {
        const user = await ctx.prisma.user.create({
          data: {
            clerkId: input.clerkId,
          },
        });

        await ctx.prisma.space.create({
          data: {
            name: "Your Space",
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
});
