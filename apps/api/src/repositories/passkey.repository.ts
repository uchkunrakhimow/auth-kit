import { prisma } from "../../lib/prisma";

export interface CreatePasskeyData {
  userId: string;
  credentialId: string;
  publicKey: string;
  deviceName?: string;
}

export interface UpdatePasskeyData {
  counter?: bigint;
  lastUsedAt?: Date;
  deviceName?: string;
}

export class PasskeyRepository {
  async create(data: CreatePasskeyData) {
    try {
      return await prisma.passkey.create({
        data,
      });
    } catch (error) {
      console.error("Error in create repository:", error);
      throw error;
    }
  }

  async findByCredentialId(credentialId: string) {
    return await prisma.passkey.findUnique({
      where: { credentialId },
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
    try {
      return await prisma.passkey.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("Error in findByUserId repository:", error);
      throw error;
    }
  }

  async findById(id: string) {
    return await prisma.passkey.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdatePasskeyData) {
    return await prisma.passkey.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await prisma.passkey.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string) {
    return await prisma.passkey.deleteMany({
      where: { userId },
    });
  }
}
