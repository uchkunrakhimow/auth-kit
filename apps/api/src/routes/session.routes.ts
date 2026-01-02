import { Router } from "express";
import { SessionController } from "../controllers/session.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { logoutDeviceDto } from "../dto/session.dto";

const router = Router();
const sessionController = new SessionController();

router.get("/", authenticate, sessionController.getMySessions.bind(sessionController));
router.delete(
  "/:sessionId",
  authenticate,
  validate(logoutDeviceDto),
  sessionController.logoutDevice.bind(sessionController)
);

export { router as sessionRoutes };

