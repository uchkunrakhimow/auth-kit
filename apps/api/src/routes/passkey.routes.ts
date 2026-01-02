import { Router } from "express";
import { PasskeyController } from "../controllers/passkey.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { createPasskeyDto, deletePasskeyDto } from "../dto/passkey.dto";

const router = Router();
const passkeyController = new PasskeyController();

router.post(
  "/",
  authenticate,
  validate(createPasskeyDto),
  passkeyController.createPasskey.bind(passkeyController)
);
router.get("/", authenticate, passkeyController.getMyPasskeys.bind(passkeyController));
router.delete(
  "/:passkeyId",
  authenticate,
  validate(deletePasskeyDto),
  passkeyController.deletePasskey.bind(passkeyController)
);

export { router as passkeyRoutes };

