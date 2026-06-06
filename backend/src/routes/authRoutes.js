const express = require('express');
const { z } = require('zod');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { generalLimiter, authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// 1. Zod schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
  }).strict(),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }).strict(),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }).strict(),
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  }).strict(),
});

// 2. Routes definitions
router.post('/register', generalLimiter, validate(registerSchema), authController.register);
router.post('/login', generalLimiter, authLimiter, validate(loginSchema), authController.login);
router.post('/logout', generalLimiter, auth, authController.logout);
router.post('/refresh', generalLimiter, validate(refreshSchema), authController.refresh);
router.post('/changepassword', generalLimiter, auth, validate(changePasswordSchema), authController.changePassword);
router.get('/me', generalLimiter, auth, authController.getMe);

module.exports = router;
