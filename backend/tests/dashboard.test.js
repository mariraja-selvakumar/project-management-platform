const request = require('supertest');
const app = require('../src/app');
const dashboardRepository = require('../src/repositories/dashboardRepository');
const auditLogRepository = require('../src/repositories/auditLogRepository');
const permissionRepository = require('../src/repositories/permissionRepository');
const { generateAccessToken } = require('../src/utils/jwt');

jest.mock('../src/repositories/dashboardRepository');
jest.mock('../src/repositories/auditLogRepository');
jest.mock('../src/repositories/permissionRepository');
jest.mock('../src/config/database', () => {
  const mockKnex = jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue({
      id: 1, email: 'admin@test.com', is_active: 1, first_name: 'Admin', last_name: 'User',
    }),
  });
  return mockKnex;
});

const makeToken = (userId = 1) => generateAccessToken({ userId, email: 'admin@test.com' });

describe('Dashboard Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // By default, user has permission
    permissionRepository.userHasPermission.mockResolvedValue(true);
    permissionRepository.getUserRoles.mockResolvedValue(['admin']);
  });

  describe('GET /api/v1/dashboard', () => {
    it('should return dashboard data', async () => {
      const mockKPIs = {
        projects: { total: 10, active: 5 },
        tasks: { total: 50, completed: 20 }
      };
      const mockTasksByStatus = { todo: 10, done: 20 };
      const mockProjectsByStatus = { active: 5, archived: 2 };
      const mockActivity = [{ id: 1, action: 'test' }];

      dashboardRepository.getKPIs.mockResolvedValue(mockKPIs);
      dashboardRepository.getTasksByStatus.mockResolvedValue(mockTasksByStatus);
      dashboardRepository.getProjectsByStatus.mockResolvedValue(mockProjectsByStatus);
      auditLogRepository.findAll.mockResolvedValue(mockActivity);

      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpis).toEqual(mockKPIs);
      expect(res.body.data.charts.tasksByStatus).toEqual(mockTasksByStatus);
      expect(res.body.data.recentActivity).toEqual(mockActivity);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/dashboard');
      expect(res.status).toBe(401);
    });

    it('should return 403 if user lacks permission', async () => {
      permissionRepository.userHasPermission.mockResolvedValue(false);

      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(403);
    });
  });
});
