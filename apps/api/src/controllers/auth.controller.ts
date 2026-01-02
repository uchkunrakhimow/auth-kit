import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AuthService } from "../services/auth.service";
import { extractDeviceInfo } from "../utils/device.util";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, email, password, profilePic } = req.body;
      const user = await this.authService.register({
        name,
        email,
        password,
        profilePic,
      });

      return res.status(201).json({
        message: "User registered successfully",
        user,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      return res.status(400).json({ message: errorMessage });
    }
  }

  async login(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const sessionToken = req.sessionID;

      if (!sessionToken) {
        return res
          .status(500)
          .json({ message: "Session initialization failed" });
      }

      const deviceInfo = extractDeviceInfo(req);
      const result = await this.authService.login(
        { email, password },
        sessionToken,
        deviceInfo
      );

      return res.status(200).json({
        message: "Login successful",
        ...result,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      return res.status(401).json({ message: errorMessage });
    }
  }

  async logout(req: AuthenticatedRequest, res: Response) {
    try {
      const sessionToken = req.sessionID;

      if (sessionToken) {
        await this.authService.logout(sessionToken);
      }

      req.session?.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Logout failed" });
        }

        return res.status(200).json({ message: "Logout successful" });
      });
    } catch (error) {
      return res.status(500).json({ message: "Logout failed" });
    }
  }
}
