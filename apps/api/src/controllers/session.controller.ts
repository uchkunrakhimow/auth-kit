import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { SessionService } from "../services/session.service";

export class SessionController {
  private sessionService: SessionService;

  constructor() {
    this.sessionService = new SessionService();
  }

  async getMySessions(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const sessions = await this.sessionService.getUserSessions(req.userId);

      return res.status(200).json({
        message: "Sessions retrieved successfully",
        sessions,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve sessions" });
    }
  }

  async logoutDevice(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { sessionId } = req.params;
      await this.sessionService.deleteSession(sessionId as string, req.userId);

      return res.status(200).json({
        message: "Device logged out successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to logout device";
      const statusCode =
        errorMessage.includes("not found") ||
        errorMessage.includes("Unauthorized")
          ? 404
          : 500;
      return res.status(statusCode).json({ message: errorMessage });
    }
  }
}
