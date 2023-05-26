import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma";

export async function memoriesRoutes(app: FastifyInstance) {
  app.get(
    "/memories",
    { preHandler: async (request) => await request.jwtVerify() },
    async (request) => {
      const { sub } = request.user;

      const memories = await prisma.memory.findMany({
        where: {
          userId: sub
        },
        orderBy: {
          createdAt: "asc"
        }
      });

      return memories.map((memory) => {
        return {
          id: memory.id,
          coverUrl: memory.coverUrl,
          excerpt: memory.content.substring(0, 115).concat("..."),
          date: memory.date,
          createdAt: memory.createdAt
        };
      });
    }
  );

  app.get(
    "/memories/:id",
    { preHandler: async (request) => await request.jwtVerify() },
    async (request, reply) => {
      const paramsSchema = z.object({
        id: z.string().uuid()
      });

      const { id } = paramsSchema.parse(request.params);

      const memory = await prisma.memory.findUniqueOrThrow({
        where: {
          id
        }
      });

      const { sub } = request.user;

      if (!memory.isPublic && memory.userId !== sub) {
        return reply.status(401).send();
      }

      return { memory };
    }
  );

  app.get("/user/:userId/memories", async (request, reply) => {
    const paramsSchema = z.object({
      userId: z.string().uuid()
    });

    const { userId } = paramsSchema.parse(request.params);

    const userAndPublicMemories = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        name: true,
        avatarUrl: true,
        memories: {
          where: {
            isPublic: true
          }
        }
      }
    });

    if (!userAndPublicMemories) {
      return reply.status(404).send({
        message: "A user with this id does not exist."
      });
    }

    return {
      user: {
        name: userAndPublicMemories.name,
        avatarUrl: userAndPublicMemories.avatarUrl
      },
      memories: userAndPublicMemories.memories.map((memory) => {
        return {
          id: memory.id,
          coverUrl: memory.coverUrl,
          excerpt: memory.content.substring(0, 115).concat("..."),
          date: memory.date,
          createdAt: memory.createdAt
        };
      })
    };
  });

  app.post(
    "/memories",
    { preHandler: async (request) => await request.jwtVerify() },
    async (request) => {
      const bodySchema = z.object({
        content: z.string(),
        coverUrl: z.string(),
        date: z.coerce.date(),
        isPublic: z.coerce.boolean().default(false)
      });

      const { content, coverUrl, date, isPublic } = bodySchema.parse(
        request.body
      );

      const { sub } = request.user;

      await prisma.memory.create({
        data: {
          content,
          coverUrl,
          date,
          isPublic,
          userId: sub
        }
      });
    }
  );

  app.put(
    "/memories/:id",
    { preHandler: async (request) => await request.jwtVerify() },
    async (request, reply) => {
      const paramsSchema = z.object({
        id: z.string().uuid()
      });

      const { id } = paramsSchema.parse(request.params);

      const bodySchema = z.object({
        content: z.string(),
        coverUrl: z.string(),
        date: z.coerce.date(),
        isPublic: z.coerce.boolean().default(false)
      });

      const { content, coverUrl, date, isPublic } = bodySchema.parse(
        request.body
      );

      let memory = await prisma.memory.findUniqueOrThrow({
        where: {
          id
        }
      });

      const { sub } = request.user;

      if (memory.userId !== sub) {
        return reply.status(401).send();
      }

      memory = await prisma.memory.update({
        where: {
          id
        },
        data: {
          content,
          coverUrl,
          date,
          isPublic
        }
      });

      return {
        memory
      };
    }
  );

  app.delete(
    "/memories/:id",
    { preHandler: async (request) => await request.jwtVerify() },
    async (request, reply) => {
      const paramsSchema = z.object({
        id: z.string().uuid()
      });

      const { id } = paramsSchema.parse(request.params);

      const memory = await prisma.memory.findUniqueOrThrow({
        where: {
          id
        }
      });

      const { sub } = request.user;

      if (memory.userId !== sub) {
        return reply.status(401).send();
      }

      await prisma.memory.delete({
        where: {
          id
        }
      });
    }
  );
}
