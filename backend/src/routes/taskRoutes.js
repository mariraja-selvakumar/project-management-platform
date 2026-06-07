const express = require('express');
const { z } = require('zod');
const taskController = require('../controllers/taskController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { generalLimiter } = require('../middleware/rateLimiter');

// Project-scoped task routes: /projects/:id/tasks
const projectTaskRouter = express.Router({ mergeParams: true });

const createTaskSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid project ID') }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(300),
    description: z.string().max(5000).optional().nullable(),
    status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    assigneeId: z.number().int().positive().optional().nullable(),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  }).strict(),
});

const listTasksSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid project ID') }),
  query: z.object({
    status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    assigneeId: z.string().regex(/^\d+$/).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }).strict(),
});

projectTaskRouter.get('/', generalLimiter, auth, requirePermission('tasks', 'read'), validate(listTasksSchema), taskController.list);
projectTaskRouter.post('/', generalLimiter, auth, requirePermission('tasks', 'create'), validate(createTaskSchema), taskController.create);

// Standalone task routes: /tasks/:id
const taskRouter = express.Router();

const updateTaskSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid task ID') }),
  body: z.object({
    title: z.string().min(1).max(300).optional(),
    description: z.string().max(5000).optional().nullable(),
    status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    assigneeId: z.number().int().positive().optional().nullable(),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  }).strict(),
});

const patchStatusSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid task ID') }),
  body: z.object({
    status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'cancelled']),
  }).strict(),
});

const idParamSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid task ID') }),
});

taskRouter.get('/', generalLimiter, auth, requirePermission('tasks', 'read'), taskController.listAll);
taskRouter.get('/:id', generalLimiter, auth, requirePermission('tasks', 'read'), validate(idParamSchema), taskController.get);
taskRouter.put('/:id', generalLimiter, auth, requirePermission('tasks', 'update'), validate(updateTaskSchema), taskController.update);
taskRouter.patch('/:id/status', generalLimiter, auth, requirePermission('tasks', 'update'), validate(patchStatusSchema), taskController.patchStatus);
taskRouter.delete('/:id', generalLimiter, auth, requirePermission('tasks', 'delete'), validate(idParamSchema), taskController.delete);

module.exports = { projectTaskRouter, taskRouter };
