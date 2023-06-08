import type { User as ClerkUser } from "@clerk/nextjs/server";

export const filterUserForClient = (user: ClerkUser) => {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    }
  }