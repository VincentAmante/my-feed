import { Webhook } from "svix";
const webhookSecret: string = process.env.WEBHOOK_SECRET || "";

// import type { IncomingHttpHeaders } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
// import type { WebhookRequiredHeaders } from "svix";
// import type { User } from "@clerk/nextjs/dist/api";
// import { Webhook } from "svix";
// import { prisma } from "~/server/db";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const payload = JSON.stringify(req.body);
  const headers = req.headers;
  const wh = new Webhook(webhookSecret);
  let evt: Event | null = null;

  console.log("payload", payload);
  console.log("headers", headers);

  res.status(201).json({});
}

// type UnwantedKeys = "emailAddresses" | "firstName" | "lastName" | "primaryEmailAddressId" | "primaryPhoneNumberId" | "phoneNumbers";

// interface UserInterface extends Omit<User , UnwantedKeys>{
//     email_addresses: {
//       email_address: string;
//       id: string;
//     }[];
//     primary_email_address_id: string;
//     first_name: string;
//     last_name: string;
//     primary_phone_number_id: string;
//     phone_numbers: {
//         phone_number: string;
//         id: string;
//     }[];
//   }
  
//   export default async function handler(
//     req: NextApiRequestWithSvixRequiredHeaders,
//     res: NextApiResponse
//   ) {
//     const payload = JSON.stringify(req.body);
//     const headers = req.headers;
//     const wh = new Webhook(webhookSecret);
//     let evt: Event | null = null;
//     try {
//       evt = wh.verify(payload, headers) as Event;
//     } catch (_) {
//       return res.status(400).json({});
//     }
//     const { id } = evt.data;
//     // Handle the webhook
//     const eventType: EventType = evt.type;
//     if (eventType === "user.created" || eventType === "user.updated") {
//         // const { first_name,last_name} = evt.data;

//         await prisma.user.create({
//             data: {
//               authId: id,
//             }
//         });
//       }
//       console.log(`User ${id} was ${eventType}`);
//       res.status(201).json({});
//     }
  
//   type NextApiRequestWithSvixRequiredHeaders = NextApiRequest & {
//     headers: IncomingHttpHeaders & WebhookRequiredHeaders;
//   };
  
//   type Event = {
//     data: UserInterface ;
//     object: "event";
//     type: EventType;
//   };
  
//   type EventType = "user.created" | "user.updated" | "*";