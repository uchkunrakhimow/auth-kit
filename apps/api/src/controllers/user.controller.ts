import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { UserRepository } from "../repositories/user.repository";

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await this.userRepository.findById(req.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "User retrieved successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve user" });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { name, picture, role } = req.body;

      const updateData: {
        name?: string;
        picture?: string | null;
        role?: string;
      } = {};

      if (name !== undefined) {
        updateData.name = name;
      }

      if (picture !== undefined) {
        updateData.picture = picture || null;
      }

      if (role !== undefined) {
        updateData.role = role;
      }

      const updatedUser = await this.userRepository.updateById(
        req.userId,
        updateData
      );

      return res.status(200).json({
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          picture: updatedUser.picture,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to update profile" });
    }
  }
}
