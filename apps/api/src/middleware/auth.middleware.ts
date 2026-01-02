import type { Request, Response, NextFunction } from "express";
import { SessionService } from "../services/session.service";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  sessionId?: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionToken = req.sessionID;

    if (!sessionToken) {
      return res.status(401).json({ message: "Unauthorized - No session" });
    }

    const sessionService = new SessionService();
    const session = await sessionService.validateSession(sessionToken);

    if (!session) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid session" });
    }

    req.userId = session.userId;
    req.sessionId = session.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
