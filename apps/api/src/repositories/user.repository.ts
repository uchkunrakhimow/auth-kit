import { prisma } from "../../lib/prisma";
import type { Role } from "../types/enums";

export interface CreateUserData {
  email: string;
  password?: string;
  googleId?: string;
  name?: string;
  picture?: string;
  accessToken?: string;
  role?: Role;
}

export interface UpdateUserData {
  name?: string;
  picture?: string;
  accessToken?: string;
  googleId?: string;
  password?: string;
  role?: Role;
}

export class UserRepository {
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findByGoogleId(googleId: string) {
    return await prisma.user.findUnique({
      where: { googleId },
    });
  }

  async findAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: CreateUserData) {
    return await prisma.user.create({
      data,
    });
  }

  async updateByEmail(email: string, data: UpdateUserData) {
    return await prisma.user.update({
      where: { email },
      data,
    });
  }

  async updateById(id: string, data: UpdateUserData) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateRole(id: string, role: Role) {
    return await prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async upsertByEmail(email: string, data: CreateUserData) {
    return await prisma.user.upsert({
      where: { email },
      create: data,
      update: {
        name: data.name,
        picture: data.picture,
        accessToken: data.accessToken,
        googleId: data.googleId,
      },
    });
  }
}
