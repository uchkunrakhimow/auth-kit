import { prisma } from "../../lib/prisma";
import type { Role } from "../types/enums";

export interface CreateSessionData {
  userId: string;
  sessionToken: string;
  deviceName?: string;
  deviceType?: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}

export interface UpdateSessionData {
  lastActivity?: Date;
  expiresAt?: Date;
  deviceName?: string;
  deviceType?: string;
}

export class SessionRepository {
  async create(data: CreateSessionData) {
    return await prisma.session.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            picture: true,
            role: true,
          },
        },
      },
    });
  }

  async findBySessionToken(sessionToken: string) {
    return await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            picture: true,
            role: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return await prisma.session.findMany({
      where: { userId },
      orderBy: { lastActivity: "desc" },
    });
  }

  async findById(id: string) {
    return await prisma.session.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateSessionData) {
    return await prisma.session.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await prisma.session.delete({
      where: { id },
    });
  }

  async deleteBySessionToken(sessionToken: string) {
    return await prisma.session.delete({
      where: { sessionToken },
    });
  }

  async deleteByUserId(userId: string) {
    return await prisma.session.deleteMany({
      where: { userId },
    });
  }

  async deleteExpired() {
    return await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
