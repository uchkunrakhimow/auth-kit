import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validation.middleware";
import { updateUserRoleDto } from "../dto/role.dto";
import { Role } from "../types/enums";

const router = Router();
const roleController = new RoleController();

router.get(
  "/users",
  authenticate,
  authorize(Role.ADMIN),
  roleController.getAllUsers.bind(roleController)
);
router.patch(
  "/users/:userId",
  authenticate,
  authorize(Role.ADMIN),
  validate(updateUserRoleDto),
  roleController.updateUserRole.bind(roleController)
);

export { router as roleRoutes };

