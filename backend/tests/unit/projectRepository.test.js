const projectRepository = require('../../src/repositories/projectRepository');
const db = require('../../src/config/database');

jest.mock('../../src/config/database', () => {
  const mDb = {
    where: jest.fn().mockReturnThis(),
    whereNot: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn(),
    update: jest.fn().mockReturnThis(),
    fn: { now: jest.fn(() => 'now') },
  };
  return jest.fn(() => mDb);
});

describe('ProjectRepository Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findAll should return projects', async () => {
    db().orderBy.mockResolvedValue([{ id: 1 }]);
    const projects = await projectRepository.findAll();
    expect(projects).toHaveLength(1);
  });

  it('findById should return project', async () => {
    db().first.mockResolvedValue({ id: 1 });
    const project = await projectRepository.findById(1);
    expect(project.id).toBe(1);
  });
});
