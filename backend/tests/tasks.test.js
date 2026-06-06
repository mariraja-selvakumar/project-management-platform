const request = require('supertest');
const app = require('../src/app');
const taskRepository = require('../src/repositories/taskRepository');
const projectRepository = require('../src/repositories/projectRepository');
const permissionRepository = require('../src/repositories/permissionRepository');
const { generateAccessToken } = require('../src/utils/jwt');

jest.mock('../src/repositories/taskRepository');
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

const mockProject = { id: 1, owner_id: 1, name: 'Test Project', status: 'active' };
const mockTask = {
  id: 1, project_id: 1, assignee_id: null, title: 'Test Task',
  description: 'A test task', status: 'todo', priority: 'medium',
  due_date: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};

describe('Tasks Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    permissionRepository.getUserRoles.mockResolvedValue(['admin']);
    permissionRepository.userHasPermission.mockResolvedValue(true);
  });

  describe('GET /api/v1/projects/:id/tasks', () => {
    it('should list tasks for a project', async () => {
      projectRepository.findById.mockResolvedValue(mockProject);
      taskRepository.findAll.mockResolvedValue([mockTask]);
      taskRepository.countAll.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/projects/1/tasks')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toMatchObject({ total: 1, page: 1 });
    });

    it('should return 404 if project does not exist', async () => {
      projectRepository.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/projects/999/tasks')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/projects/:id/tasks', () => {
    it('should create a new task in a project', async () => {
      projectRepository.findById.mockResolvedValue(mockProject);
      taskRepository.create.mockResolvedValue(mockTask);

      const res = await request(app)
        .post('/api/v1/projects/1/tasks')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ title: 'Test Task', priority: 'high' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Task');
    });

    it('should return 422 if title is missing', async () => {
      const res = await request(app)
        .post('/api/v1/projects/1/tasks')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ priority: 'medium' });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should return task details', async () => {
      taskRepository.findById.mockResolvedValue(mockTask);

      const res = await request(app)
        .get('/api/v1/tasks/1')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Test Task');
    });

    it('should return 404 for missing task', async () => {
      taskRepository.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/tasks/999')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    it('should update a task (admin/manager)', async () => {
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue({ ...mockTask, title: 'Updated Task' });

      const res = await request(app)
        .put('/api/v1/tasks/1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ title: 'Updated Task' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Task');
    });
  });

  describe('PATCH /api/v1/tasks/:id/status', () => {
    it('should update only the status of a task', async () => {
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue({ ...mockTask, status: 'in_progress' });

      const res = await request(app)
        .patch('/api/v1/tasks/1/status')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('in_progress');
    });

    it('should return 422 for invalid status', async () => {
      const res = await request(app)
        .patch('/api/v1/tasks/1/status')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(422);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete a task', async () => {
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.delete.mockResolvedValue(1);

      const res = await request(app)
        .delete('/api/v1/tasks/1')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
