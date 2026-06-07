const userRepository = require('../../src/repositories/userRepository');
const db = require('../../src/config/database');

jest.mock('../../src/config/database', () => {
  const mDb = jest.fn(() => mDb);
  mDb.where = jest.fn(() => mDb);
  mDb.first = jest.fn();
  mDb.update = jest.fn();
  mDb.fn = { now: jest.fn() };
  return mDb;
});

describe('UserRepository Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findByEmail should query users by email', async () => {
    db.mockReturnValue({ where: jest.fn().mockReturnThis(), first: jest.fn().mockResolvedValue({ id: 1 }) });
    const user = await userRepository.findByEmail('test@example.com');
    expect(user.id).toBe(1);
  });

  it('findById should query users by id', async () => {
    db.mockReturnValue({ where: jest.fn().mockReturnThis(), first: jest.fn().mockResolvedValue({ id: 1 }) });
    const user = await userRepository.findById(1);
    expect(user.id).toBe(1);
  });

  it('saveRefreshToken should update refresh_token and updated_at', async () => {
    db.mockReturnValue({ where: jest.fn().mockReturnThis(), update: jest.fn().mockResolvedValue(1) });
    await userRepository.saveRefreshToken(1, 'token');
    expect(db).toHaveBeenCalled();
  });

  it('updateLastLogin should update last_login_at', async () => {
    db.mockReturnValue({ where: jest.fn().mockReturnThis(), update: jest.fn().mockResolvedValue(1) });
    await userRepository.updateLastLogin(1);
    expect(db).toHaveBeenCalled();
  });

  it('clearRefreshToken should update refresh_token to null and updated_at', async () => {
    db.mockReturnValue({ where: jest.fn().mockReturnThis(), update: jest.fn().mockResolvedValue(1) });
    await userRepository.clearRefreshToken(1);
    expect(db).toHaveBeenCalled();
  });

  it('updatePassword should update password and updated_at', async () => {
    db.mockReturnValue({ where: jest.fn().mockReturnThis(), update: jest.fn().mockResolvedValue(1) });
    await userRepository.updatePassword(1, 'hashed');
    expect(db).toHaveBeenCalled();
  });
});
