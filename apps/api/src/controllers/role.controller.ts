import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { RoleService } from "../services/role.service";

export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await this.roleService.getAllUsers();

      return res.status(200).json({
        message: "Users retrieved successfully",
        users,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve users" });
    }
  }

  async updateUserRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const user = await this.roleService.updateUserRole(
        userId as string,
        role
      );

      return res.status(200).json({
        message: "User role updated successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          role: user.role,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user role";
      const statusCode = errorMessage.includes("not found") ? 404 : 500;
      return res.status(statusCode).json({ message: errorMessage });
    }
  }
}
