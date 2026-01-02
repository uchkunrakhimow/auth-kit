import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { updateProfileDto } from "../dto/auth.dto";

const router = Router();
const userController = new UserController();

router.get("/me", authenticate, userController.getMe.bind(userController));
router.patch(
  "/me",
  authenticate,
  validate(updateProfileDto),
  userController.updateProfile.bind(userController)
);

export { router as userRoutes };
