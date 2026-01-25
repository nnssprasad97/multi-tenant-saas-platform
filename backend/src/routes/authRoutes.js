import express from "express";
import { registerTenant, login, getMe, logout } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate, registerTenantSchema, loginSchema } from "../middleware/validate.js";

const router = express.Router();

router.post("/register-tenant", validate(registerTenantSchema), registerTenant);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

export default router;
