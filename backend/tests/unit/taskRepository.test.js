const taskRepository = require('../../src/repositories/taskRepository');
const db = require('../../src/config/database');

jest.mock('../../src/config/database', () => {
  const mDb = {
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn(),
    update: jest.fn().mockReturnThis(),
    del: jest.fn(),
    fn: { now: jest.fn(() => 'now') },
  };
  return jest.fn(() => mDb);
});

describe('TaskRepository Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findAll should return tasks', async () => {
    db().orderBy.mockResolvedValue([{ id: 1 }]);
    const tasks = await taskRepository.findAll();
    expect(tasks).toHaveLength(1);
  });

  it('findById should return task', async () => {
    db().first.mockResolvedValue({ id: 1 });
    const task = await taskRepository.findById(1);
    expect(task.id).toBe(1);
  });
});
