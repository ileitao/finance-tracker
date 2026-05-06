import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/user";

import { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      userId: string;
      email: string;
    };
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // 1. Get token from header (example using JWT)
    const token = request.headers.authorization?.replace("Bearer ", "");
    if (!token) throw new Error("No token");

    // 2. Verify token (logic depends on your JWT setup)
    // Checks the signature (was this token signed with our secret?) and checks expiry
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JWTPayload;

    // 3. Attach user to request for use in route handlers
    // Enrich the request object
    request.user = decoded;
  } catch (err) {
    reply.status(401).send({ error: "Unauthorized" });
  }
}
