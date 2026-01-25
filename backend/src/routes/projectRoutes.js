import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createProject,
  listProjects,
  updateProject,
  deleteProject,
  getProjectById,
} from "../controllers/projectController.js";
import { validate, createProjectSchema } from "../middleware/validate.js";

const router = express.Router();

router.post("/projects", authenticate, validate(createProjectSchema), createProject);
router.get("/projects", authenticate, listProjects);
router.put("/projects/:projectId", authenticate, validate(createProjectSchema), updateProject);
router.get("/projects/:projectId", authenticate, getProjectById);
router.delete("/projects/:projectId", authenticate, deleteProject);

export default router;
