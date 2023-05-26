import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { z } from "zod";

export const clerkWebhookSchema = z.object({
  type: z.enum(["user.created", "user.deleted"]),
  data: z.object({
    id: z.string(),
  }),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req);

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  } else {
    const valid = clerkWebhookSchema.safeParse(req.body);
    if (!valid.success) {
      res.status(400).json({ message: "Invalid request" });
      return;
    } else {
      const parsed = valid.data;

      switch (parsed.type) {
        case "user.created": {
          await prisma.user.create({
            data: {
              authId: parsed.data.id,
            },
          });
          console.log("user created", parsed.data.id);
          break;
        }
        case "user.deleted": {
          await prisma.user.delete({
            where: {
              authId: parsed.data.id,
            },
          });
          console.log("user deleted", parsed.data.id);
          break;
        }
      }
      res.status(200).end();
    }
  }
}