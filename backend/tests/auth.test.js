const request = require('supertest');
const app = require('../src/app');
const userRepository = require('../src/repositories/userRepository');
const { generateAccessToken, generateRefreshToken } = require('../src/utils/jwt');
const bcrypt = require('bcryptjs');

// Mock dependencies
jest.mock('../src/repositories/userRepository');
jest.mock('../src/config/database', () => {
  // Mock knex instance for middlewares and repositories
  const mockKnex = jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    first: jest.fn().mockImplementation(() => {
      // Mock user return for auth middleware
      return Promise.resolve({
        id: 1,
        email: 'test@example.com',
        is_active: 1,
        first_name: 'Test',
        last_name: 'User',
      });
    }),
    insert: jest.fn().mockResolvedValue([1]),
    update: jest.fn().mockResolvedValue(1),
    del: jest.fn().mockResolvedValue(1),
  }));
  return mockKnex;
});

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate user and return tokens', async () => {
      const mockPasswordHash = await bcrypt.hash('password123', 12);
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: mockPasswordHash,
        first_name: 'Test',
        last_name: 'User',
        is_active: 1,
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      userRepository.saveRefreshToken.mockResolvedValue(true);
      userRepository.updateLastLogin.mockResolvedValue(true);
      userRepository.getPermissions.mockResolvedValue(['projects:read']);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.user.permissions).toContain('projects:read');
      expect(res.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should return 401 for invalid credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should log out user and clear refresh token', async () => {
      userRepository.clearRefreshToken.mockResolvedValue(true);
      const token = generateAccessToken({ userId: 1, email: 'test@example.com' });

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(userRepository.clearRefreshToken).toHaveBeenCalledWith(1);
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should rotate and return new tokens', async () => {
      const refreshToken = generateRefreshToken({ userId: 1, email: 'test@example.com' });
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        is_active: 1,
        refresh_token: refreshToken,
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.saveRefreshToken.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should return 401 if refresh token does not match DB', async () => {
      const refreshToken = generateRefreshToken({ userId: 1, email: 'test@example.com' });
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        is_active: 1,
        refresh_token: 'different_token_in_db',
      };

      userRepository.findById.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/changepassword', () => {
    it('should update password and clear refresh token', async () => {
      const token = generateAccessToken({ userId: 1, email: 'test@example.com' });
      const mockPasswordHash = await bcrypt.hash('oldpassword', 12);
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: mockPasswordHash,
        is_active: 1,
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updatePassword.mockResolvedValue(true);
      userRepository.clearRefreshToken.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/v1/auth/changepassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'oldpassword',
          newPassword: 'newpassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(userRepository.updatePassword).toHaveBeenCalled();
      expect(userRepository.clearRefreshToken).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user profile and permissions', async () => {
      const token = generateAccessToken({ userId: 1, email: 'test@example.com' });
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_active: 1,
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.getPermissions.mockResolvedValue(['projects:read', 'tasks:create']);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.body.data.permissions).toContain('projects:read');
    });
  });
});
