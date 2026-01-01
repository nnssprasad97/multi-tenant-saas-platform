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
