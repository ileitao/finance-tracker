import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { FastifyInstance } from "fastify";
import { type RegisterBody, type LoginBody } from "../types/user";
import { authSchema } from "../schemas/auth.schema";
import prisma from "../lib/prisma";

export async function authRoutes(app: FastifyInstance) {
  // POST /register
  app.post<{ Body: RegisterBody }>("/register", async (request, reply) => {
    try {
      const body = authSchema.parse(request.body);
    } catch (error: any) {
      return reply.status(400).send({ error: "Incorrect data format" });
    }

    try {
      const hash = await bcrypt.hash(request.body.password, 10);

      const user = await prisma.user.create({
        data: { ...request.body, password: hash },
      });

      const { password: _, ...userWithoutPassword } = user;
      return reply.status(201).send(userWithoutPassword);
    } catch (error: any) {
      if (error.code === "P2002") {
        return reply.status(409).send({ error: "Email already registered" });
      }
      throw error;
    }
  });

  // POST /login
  app.post<{ Body: LoginBody }>("/login", async (request, reply) => {
    try {
      const body = authSchema.parse(request.body);
    } catch (error: any) {
      return reply.status(400).send({ error: "Incorrect data format" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email: request.body.email },
      });
      if (!user) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      const match = await bcrypt.compare(request.body.password, user?.password);
      if (!match) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" },
      );

      return reply.status(200).send({ token });
    } catch (error: any) {
      throw error;
    }
  });
}
