import type { IncomingHttpHeaders } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { WebhookRequiredHeaders } from "svix";
import { Webhook } from "svix";
import { prisma } from "~/server/db";
import type { Prisma } from "@prisma/client";

const webhookSecret: string = process.env.WEBHOOK_SECRET || "";

export default async function handler(
  req: NextApiRequestWithSvixRequiredHeaders,
  res: NextApiResponse,
) {
  const payload = JSON.stringify(req.body);
  const headers = req.headers;
  const wh = new Webhook(webhookSecret);
  let evt: Event | null = null;
  try {
    evt = wh.verify(payload, headers) as Event;
  } catch (_) {
    return res.status(400).json({});
  }

  const { id } = evt.data;
  // Handle the webhook
  const eventType: EventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id } = evt.data;

    if (!id) {
      return res.status(400).json({});
    }

    await prisma.user.upsert({
      where: { authId: id },
      update: {
      },
      create: {
        authId: id,
      },
    });
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.log(`User ${id} was ${eventType}`);
  res.status(201).json({});
}

type NextApiRequestWithSvixRequiredHeaders = NextApiRequest & {
  headers: IncomingHttpHeaders & WebhookRequiredHeaders;
};

type Event = {
  data: Prisma.UserCreateInput;
  object: "event";
  type: EventType;
};

type EventType = "user.created" | "user.updated" | "*";