const dashboardRepository = require('../../src/repositories/dashboardRepository');
const db = require('../../src/config/database');

jest.mock('../../src/config/database', () => {
  const mDb = jest.fn(() => mDb);
  mDb.select = jest.fn(() => mDb);
  mDb.first = jest.fn();
  mDb.count = jest.fn(() => mDb);
  mDb.groupBy = jest.fn(() => mDb);
  mDb.raw = jest.fn((str) => str);
  return mDb;
});

describe('DashboardRepository Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getKPIs should return KPIs', async () => {
    db().first.mockResolvedValueOnce({ total: 10, active: 5 });
    db().first.mockResolvedValueOnce({ total: 20, completed: 10 });
    
    const result = await dashboardRepository.getKPIs();
    expect(result.projects.total).toBe(10);
    expect(result.tasks.completed).toBe(10);
  });

  it('getTasksByStatus should return task counts by status', async () => {
    db().groupBy.mockResolvedValue([{ status: 'todo', count: 5 }]);
    
    const result = await dashboardRepository.getTasksByStatus();
    expect(result.todo).toBe(5);
  });
});
