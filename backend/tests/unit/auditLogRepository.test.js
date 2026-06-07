const auditLogRepository = require('../../src/repositories/auditLogRepository');
const db = require('../../src/config/database');

jest.mock('../../src/config/database', () => {
  const mDb = {
    insert: jest.fn(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn(),
  };
  return jest.fn(() => mDb);
});

describe('AuditLogRepository Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('create should insert and return id', async () => {
    db().insert.mockResolvedValue([1]);
    const id = await auditLogRepository.create({ action: 'test', resourceType: 'project' });
    expect(id).toBe(1);
  });

  it('findAll should query audit logs', async () => {
    db().orderBy.mockResolvedValue([]);
    await auditLogRepository.findAll({ userId: 1 });
    expect(db().where).toHaveBeenCalled();
  });
});
