import { Router } from 'express';
import * as userProjectController from '../controllers/userProject.controller';
import { authenticate } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/rateLimit';

const router = Router();

/**
 * User Project Routes
 * Base path: /v1/user-projects
 */

/**
 * @route   POST /v1/user-projects/create-project
 * @desc    Create a new user project
 * @access  Private
 * @header  Authorization: Bearer <access_token>
 * @body    projectName - Project name
 * @body    userIdea - User's research idea/abstract
 */
router.post('/create-project', authenticate, apiLimiter, userProjectController.createProject);

/**
 * @route   GET /v1/user-projects/my-projects
 * @desc    Get all projects for the authenticated user
 * @access  Private
 * @header  Authorization: Bearer <access_token>
 */
router.get('/my-projects', authenticate, apiLimiter, userProjectController.getUserProjects);

/**
 * @route   GET /v1/user-projects/user/:userId
 * @desc    Get all projects for a specific user by userId
 * @access  Public
 * @param   userId - User ID (UUID)
 */
router.get('/user/:userId', apiLimiter, userProjectController.getProjectsByUserId);

/**
 * @route   GET /v1/user-projects/:projectId
 * @desc    Get a specific project by ID
 * @access  Private
 * @header  Authorization: Bearer <access_token>
 * @param   projectId - Project ID (UUID)
 */
router.get('/:projectId', authenticate, apiLimiter, userProjectController.getProjectById);

/**
 * @route   PUT /v1/user-projects/:projectId
 * @desc    Update a project
 * @access  Private
 * @header  Authorization: Bearer <access_token>
 * @param   projectId - Project ID (UUID)
 * @body    projectName - Updated project name (optional)
 * @body    userIdea - Updated user idea (optional)
 */
router.put('/:projectId', authenticate, apiLimiter, userProjectController.updateProject);

/**
 * @route   DELETE /v1/user-projects/:projectId
 * @desc    Delete a project
 * @access  Private
 * @header  Authorization: Bearer <access_token>
 * @param   projectId - Project ID (UUID)
 */
router.delete('/:projectId', authenticate, apiLimiter, userProjectController.deleteProject);

/**
 * @route   GET /v1/user-projects/:projectId/export
 * @desc    Export project report as Excel
 * @access  Private
 * @header  Authorization: Bearer <access_token>
 * @param   projectId - Project ID
 */
router.get('/:projectId/export', authenticate, apiLimiter, userProjectController.exportProject);

export default router;
