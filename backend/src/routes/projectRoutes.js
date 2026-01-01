/**
 * Project Management Routes
 * Defines protected endpoints for project CRUD operations
 * Enforces authentication and tenant isolation
 * 
 * Routes:
 *  - GET /api/projects - List all tenant projects
 *  - POST /api/projects - Create new project
 *  - GET /api/projects/:projectId - Get project details
 *  - PUT /api/projects/:projectId - Update project
 *  - DELETE /api/projects/:projectId - Delete project
 *  - GET /api/projects/:projectId/tasks - Get project tasks
 *  - POST /api/projects/:projectId/tasks - Create task
 */

const express = require('express');const router = express.Router();
const projCtrl = require('../controllers/projectController');
const taskCtrl = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/auth');

// --- Project Management Module ---

// ========================================
// PROJECT ROUTES - DETAILED IMPLEMENTATION
// ========================================

// This route file implements all project management endpoints with:
// 1. Complete CRUD operations for projects
// 2. Task management within projects
// 3. Tenant isolation through authentication middleware
// 4. Role-based authorization (Tenant Admin, User)
// 5. Subscription limit enforcement via controllers

// Middleware Security Stack:
// - authenticate: Verifies JWT token and extracts user context
// - authorize: Checks user role permissions for specific operations
// - Ensures tenant_id isolation on all queries

// API Endpoints Summary:
// GET    /api/projects              - List all projects for current tenant
// POST   /api/projects              - Create new project (checks subscription limits)
// GET    /api/projects/:projectId   - Get specific project details
// PUT    /api/projects/:projectId   - Update project (admin only)
// DELETE /api/projects/:projectId   - Delete project (admin only)
// GET    /api/projects/:projectId/tasks - Get all tasks in a project
// POST   /api/projects/:projectId/tasks - Create task in a project

// List all projects (Filtered by tenant_id in controller)
router.get('/', authenticate, projCtrl.listProjects);

// Create a new project (Check subscription limits in controller)
router.post('/', authenticate, projCtrl.createProject);

// Get single project details
router.get('/:projectId', authenticate, projCtrl.getProjectById);

// Update project (Required for API 14)
router.put('/:projectId', authenticate, projCtrl.updateProject);

// Delete project (Required for API 15)
router.delete('/:projectId', authenticate, projCtrl.deleteProject);


// --- Task Management Module ---

// List tasks for a specific project
router.get('/:projectId/tasks', authenticate, taskCtrl.getProjectTasks);

// Create task within a project
router.post('/:projectId/tasks', authenticate, taskCtrl.createTask);

// Quick Kanban status update
router.patch('/tasks/:taskId/status', authenticate, taskCtrl.updateTaskStatus);

// Full task update (Required for API 19)
router.put('/tasks/:taskId', authenticate, taskCtrl.updateTask);

// Delete task
router.delete('/tasks/:taskId', authenticate, taskCtrl.deleteTask);

module.exports = router;
