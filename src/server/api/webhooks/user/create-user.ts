import type { IncomingHttpHeaders } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { WebhookRequiredHeaders } from "svix";
import type { User } from "@clerk/nextjs/api";
import { Webhook } from "svix";
import { prisma } from "~/server/db";

type UnwantedKeys = "emailAddresses" | "firstName" | "lastName" | "primaryEmailAddressId" | "primaryPhoneNumberId" | "phoneNumbers";

interface UserInterface extends Omit<User, UnwantedKeys>{
    first_name: string;
    last_name: string;
  }
  
  const webhookSecret: string = process.env.WEBHOOK_SECRET || "";
  
  export default async function handler(
    req: NextApiRequestWithSvixRequiredHeaders,
    res: NextApiResponse
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
      
        await prisma.user.upsert({
          where: { authId: id },
          update: {
            name: "",
          },
          create: {
            authId: id
          },
        });
      }
      console.log(`User ${id} was ${eventType}`);
      res.status(201).json({});
    }
  
  type NextApiRequestWithSvixRequiredHeaders = NextApiRequest & {
    headers: IncomingHttpHeaders & WebhookRequiredHeaders;
  };
  
  type Event = {
    data: UserInterface;
    object: "event";
    type: EventType;
  };
  
  type EventType = "user.created" | "user.updated" | "*";