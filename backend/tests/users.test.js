const request = require('supertest');
const app = require('../src/app');
const usersRepository = require('../src/repositories/usersRepository');
const permissionRepository = require('../src/repositories/permissionRepository');
const { generateAccessToken } = require('../src/utils/jwt');

jest.mock('../src/repositories/usersRepository');
jest.mock('../src/repositories/permissionRepository');
jest.mock('../src/repositories/auditLogRepository');
jest.mock('../src/config/database', () => {
  const mockKnex = jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue({
      id: 1, email: 'admin@test.com', is_active: 1, first_name: 'Admin', last_name: 'User',
    }),
    insert: jest.fn().mockResolvedValue([1]),
    update: jest.fn().mockResolvedValue(1),
    del: jest.fn().mockResolvedValue(1),
  }));
  return mockKnex;
});

const makeToken = (userId = 1) => generateAccessToken({ userId, email: 'admin@test.com' });

const mockUser = {
  id: 2, email: 'user@test.com', first_name: 'John', last_name: 'Doe',
  is_active: 1, last_login_at: null,
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};

describe('Users Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    permissionRepository.getUserRoles.mockResolvedValue(['admin']);
    permissionRepository.userHasPermission.mockResolvedValue(true);
  });

  describe('GET /api/v1/users', () => {
    it('should list all users', async () => {
      usersRepository.findAll.mockResolvedValue([mockUser]);
      usersRepository.countAll.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/users');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/users/invite', () => {
    it('should invite a new user', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/users/invite')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ email: 'newuser@test.com', firstName: 'Jane', lastName: 'Doe', roleIds: [3] });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if email already exists', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/users/invite')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ email: 'user@test.com', firstName: 'Jane', lastName: 'Doe', roleIds: [3] });

      expect(res.status).toBe(400);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/users/invite')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ email: 'not-an-email', firstName: 'Jane', lastName: 'Doe' });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return a user with roles', async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      usersRepository.getUserRoles.mockResolvedValue([{ id: 2, name: 'manager' }]);

      const res = await request(app)
        .get('/api/v1/users/2')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('user@test.com');
      expect(res.body.data.roles).toBeDefined();
    });

    it('should return 404 for unknown user', async () => {
      usersRepository.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/users/999')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update user details', async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      usersRepository.update.mockResolvedValue({ ...mockUser, first_name: 'Updated' });

      const res = await request(app)
        .put('/api/v1/users/2')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ firstName: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.first_name).toBe('Updated');
    });
  });

  describe('PUT /api/v1/users/:id/roles', () => {
    it('should update user roles', async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      usersRepository.getUserRoles.mockResolvedValue([{ id: 3, name: 'member' }]);
      usersRepository.setUserRoles.mockResolvedValue([{ id: 2, name: 'manager' }]);

      const res = await request(app)
        .put('/api/v1/users/2/roles')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ roleIds: [2] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should deactivate a user (soft delete)', async () => {
      usersRepository.findById.mockResolvedValue({ ...mockUser, is_active: 1 });
      usersRepository.deactivate.mockResolvedValue(1);

      const res = await request(app)
        .delete('/api/v1/users/2')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if user is already deactivated', async () => {
      usersRepository.findById.mockResolvedValue({ ...mockUser, is_active: 0 });

      const res = await request(app)
        .delete('/api/v1/users/2')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(400);
    });
  });
});
