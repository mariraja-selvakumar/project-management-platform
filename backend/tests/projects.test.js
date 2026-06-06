const request = require('supertest');
const app = require('../src/app');
const projectRepository = require('../src/repositories/projectRepository');
const permissionRepository = require('../src/repositories/permissionRepository');
const { generateAccessToken } = require('../src/utils/jwt');

jest.mock('../src/repositories/projectRepository');
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

const mockProject = {
  id: 1, owner_id: 1, name: 'Test Project', description: 'A test project',
  status: 'active', start_date: null, due_date: null,
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};

describe('Projects Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // By default, admin has all permissions
    permissionRepository.getUserRoles.mockResolvedValue(['admin']);
    permissionRepository.userHasPermission.mockResolvedValue(true);
  });

  describe('GET /api/v1/projects', () => {
    it('should list projects with pagination meta', async () => {
      projectRepository.findAll.mockResolvedValue([mockProject]);
      projectRepository.countAll.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toMatchObject({ total: 1, page: 1, limit: 20 });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/projects');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/projects', () => {
    it('should create a new project', async () => {
      projectRepository.create.mockResolvedValue(mockProject);

      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ name: 'Test Project', description: 'A test project' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Project');
    });

    it('should return 422 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 if user lacks create permission', async () => {
      permissionRepository.userHasPermission.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ name: 'New Project' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('should return project details with task summary', async () => {
      projectRepository.findById.mockResolvedValue(mockProject);
      projectRepository.getTaskCounts.mockResolvedValue({ todo: 2, in_progress: 1, done: 1, in_review: 0, cancelled: 0 });

      const res = await request(app)
        .get('/api/v1/projects/1')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.taskSummary).toBeDefined();
    });

    it('should return 404 for non-existent project', async () => {
      projectRepository.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/projects/999')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/projects/:id', () => {
    it('should update a project', async () => {
      projectRepository.findById.mockResolvedValue(mockProject);
      projectRepository.update.mockResolvedValue({ ...mockProject, name: 'Updated Project' });

      const res = await request(app)
        .put('/api/v1/projects/1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ name: 'Updated Project' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Project');
    });
  });

  describe('DELETE /api/v1/projects/:id', () => {
    it('should soft-delete a project by setting status to archived', async () => {
      projectRepository.findById.mockResolvedValue(mockProject);
      projectRepository.update.mockResolvedValue({ ...mockProject, status: 'archived' });

      const res = await request(app)
        .delete('/api/v1/projects/1')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/projects/:id/stats', () => {
    it('should return project statistics', async () => {
      projectRepository.findById.mockResolvedValue(mockProject);
      projectRepository.getTaskCounts.mockResolvedValue({ todo: 3, in_progress: 2, done: 5, in_review: 1, cancelled: 0 });

      const res = await request(app)
        .get('/api/v1/projects/1/stats')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalTasks).toBe(11);
      expect(res.body.data.completedTasks).toBe(5);
      expect(res.body.data.completionRate).toBe(45);
    });
  });
});
