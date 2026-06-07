const usersRepository = require('../../src/repositories/usersRepository');
const db = require('../../src/config/database');

jest.mock('../../src/config/database', () => {
  const mDb = jest.fn(() => mDb);
  
  // Chainable methods
  mDb.where = jest.fn(() => mDb);
  mDb.whereIn = jest.fn(() => mDb);
  mDb.limit = jest.fn(() => mDb);
  mDb.offset = jest.fn(() => mDb);
  mDb.orderBy = jest.fn(() => mDb);
  mDb.select = jest.fn(() => mDb);
  mDb.join = jest.fn(() => mDb);
  mDb.count = jest.fn(() => mDb);
  mDb.update = jest.fn(() => mDb);
  
  // Terminal methods
  mDb.first = jest.fn();
  mDb.insert = jest.fn();
  mDb.del = jest.fn();
  
  // Transaction
  mDb.transaction = jest.fn((cb) => cb(mDb));
  
  // Other
  mDb.fn = { now: jest.fn(() => 'now') };
  
  return mDb;
});

describe('UsersRepository Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findAll should return formatted users with roles', async () => {
    const mockUsers = [{ id: 1, first_name: 'John' }];
    const mockRoles = [{ user_id: 1, name: 'admin' }];
    
    db().select.mockResolvedValueOnce(mockUsers);
    db().whereIn.mockResolvedValue(mockRoles);

    const result = await usersRepository.findAll();
    
    expect(result).toHaveLength(1);
    expect(result[0].roles).toContain('admin');
  });

  it('findById should query users by id', async () => {
    db().first.mockResolvedValue({ id: 1 });
    const user = await usersRepository.findById(1);
    expect(user.id).toBe(1);
  });

  it('findByEmail should query users by email', async () => {
    db().first.mockResolvedValue({ id: 1, email: 'test@example.com' });
    const user = await usersRepository.findByEmail('test@example.com');
    expect(user.email).toBe('test@example.com');
  });

  it('create should create user in transaction', async () => {
    db().insert.mockResolvedValueOnce([1]);
    db().first.mockResolvedValue({ id: 1 });
    const user = await usersRepository.create({ email: 'test@test.com' }, [1]);
    expect(user.id).toBe(1);
  });

  it('update should update user data and return updated user', async () => {
    db().first.mockResolvedValue({ id: 1, first_name: 'Jane' });
    const user = await usersRepository.update(1, { firstName: 'Jane' });
    expect(user.first_name).toBe('Jane');
  });

  it('deactivate should deactivate user', async () => {
    db().update.mockResolvedValue(1);
    await usersRepository.deactivate(1);
    expect(db().update).toHaveBeenCalled();
  });
});
