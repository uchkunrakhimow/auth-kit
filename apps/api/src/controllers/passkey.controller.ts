import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { PasskeyService } from "../services/passkey.service";

export class PasskeyController {
  private passkeyService: PasskeyService;

  constructor() {
    this.passkeyService = new PasskeyService();
  }

  async createPasskey(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { credentialId, publicKey, deviceName } = req.body;

      const passkey = await this.passkeyService.createPasskey({
        userId: req.userId,
        credentialId,
        publicKey,
        deviceName,
      });

      return res.status(201).json({
        message: "Passkey created successfully",
        passkey,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create passkey";
      return res.status(400).json({ message: errorMessage });
    }
  }

  async getMyPasskeys(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const passkeys = await this.passkeyService.getUserPasskeys(req.userId);

      return res.status(200).json({
        message: "Passkeys retrieved successfully",
        passkeys,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve passkeys" });
    }
  }

  async deletePasskey(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { passkeyId } = req.params;
      await this.passkeyService.deletePasskey(passkeyId as string, req.userId);

      return res.status(200).json({
        message: "Passkey deleted successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete passkey";
      const statusCode =
        errorMessage.includes("not found") ||
        errorMessage.includes("Unauthorized")
          ? 404
          : 500;
      return res.status(statusCode).json({ message: errorMessage });
    }
  }
}
