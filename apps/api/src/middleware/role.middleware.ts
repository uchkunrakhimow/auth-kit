import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware";
import { Role } from "../types/enums";
import { UserRepository } from "../repositories/user.repository";

export const authorize = (...allowedRoles: Role[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userRepository = new UserRepository();
      const user = await userRepository.findById(req.userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (!allowedRoles.includes(user.role as Role)) {
        return res.status(403).json({
          message: "Forbidden - Insufficient permissions",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
