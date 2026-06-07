const permissionRepository = require('../../src/repositories/permissionRepository');
const db = require('../../src/config/database');

jest.mock('../../src/config/database', () => {
  const mDb = {
    join: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn(),
  };
  return jest.fn(() => mDb);
});

describe('PermissionRepository Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getUserRoles should return roles', async () => {
    db().select.mockResolvedValue([{ name: 'admin' }]);
    const roles = await permissionRepository.getUserRoles(1);
    expect(roles).toEqual(['admin']);
  });

  it('userHasPermission should return true for admin', async () => {
    db().select.mockResolvedValue([{ name: 'admin' }]);
    const hasPermission = await permissionRepository.userHasPermission(1, 'projects:create');
    expect(hasPermission).toBe(true);
  });
});
