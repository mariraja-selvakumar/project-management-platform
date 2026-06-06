const express = require('express');
const { z } = require('zod');
const projectController = require('../controllers/projectController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Zod Schemas
const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().max(5000).optional(),
    status: z.enum(['active', 'on_hold', 'completed', 'archived']).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  }).strict(),
});

const updateProjectSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid project ID') }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional().nullable(),
    status: z.enum(['active', 'on_hold', 'completed', 'archived']).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  }).strict(),
});

const listProjectsSchema = z.object({
  query: z.object({
    status: z.enum(['active', 'on_hold', 'completed', 'archived']).optional(),
    ownerId: z.string().regex(/^\d+$/).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }).strict(),
});

const idParamSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid project ID') }),
});

// Routes
router.get('/', generalLimiter, auth, requirePermission('projects', 'read'), validate(listProjectsSchema), projectController.list);
router.post('/', generalLimiter, auth, requirePermission('projects', 'create'), validate(createProjectSchema), projectController.create);
router.get('/:id', generalLimiter, auth, requirePermission('projects', 'read'), validate(idParamSchema), projectController.get);
router.put('/:id', generalLimiter, auth, requirePermission('projects', 'update'), validate(updateProjectSchema), projectController.update);
router.delete('/:id', generalLimiter, auth, requirePermission('projects', 'delete'), validate(idParamSchema), projectController.delete);
router.get('/:id/stats', generalLimiter, auth, requirePermission('projects', 'read'), validate(idParamSchema), projectController.stats);

module.exports = router;
