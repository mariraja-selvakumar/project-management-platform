const express = require('express');
const { z } = require('zod');
const usersController = require('../controllers/usersController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Schemas
const inviteUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    temporaryPassword: z.string().min(8, 'Temporary password must be at least 8 characters').optional(),
    roleIds: z.array(z.number().int().positive()).min(1, 'At least one role is required'),
  }).strict(),
});

const selfUpdateSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid user ID') }),
  body: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
  }).strict(),
});

const adminUpdateSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'Invalid user ID') }),
  body: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
  }).strict(),
});

// Middleware to check if user is updating self
const isSelfOrHasPermission = (permission) => async (req, res, next) => {
    if (req.user.userId === parseInt(req.params.id)) return next();
    return requirePermission('users', 'manage')(req, res, next);
};

// Routes
router.get('/', generalLimiter, auth, requirePermission('users', 'read'), validate(listUsersSchema), usersController.list);
router.post('/invite', generalLimiter, auth, requirePermission('users', 'manage'), validate(inviteUserSchema), usersController.invite);
router.get('/:id', generalLimiter, auth, requirePermission('users', 'read'), validate(idParamSchema), usersController.get);
// Combined update route
router.put('/:id', generalLimiter, auth, isSelfOrHasPermission('update'), validate(selfUpdateSchema), usersController.update);
router.put('/:id/roles', generalLimiter, auth, requirePermission('users', 'manage'), validate(updateRolesSchema), usersController.updateRoles);
router.delete('/:id', generalLimiter, auth, requirePermission('users', 'manage'), validate(idParamSchema), usersController.deactivate);

module.exports = router;
