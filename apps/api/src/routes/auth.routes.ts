import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middleware/validation.middleware";
import { loginDto, registerDto, logoutDto } from "../dto/auth.dto";

const router = Router();
const authController = new AuthController();

router.post("/register", validate(registerDto), authController.register.bind(authController));
router.post("/login", validate(loginDto), authController.login.bind(authController));
router.post("/logout", validate(logoutDto), authController.logout.bind(authController));

export { router as authRoutes };

