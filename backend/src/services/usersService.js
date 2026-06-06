const bcrypt = require('bcryptjs');
const usersRepository = require('../repositories/usersRepository');
const auditLogService = require('./auditLogService');
const { notFound, badRequest } = require('../utils/errors');

class UsersService {
  async listUsers(filters, userContext) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const dbFilters = {};
    if (filters.isActive !== undefined) dbFilters.isActive = filters.isActive === 'true' ? 1 : 0;

    const users = await usersRepository.findAll({ ...dbFilters, limit, offset });
    const total = await usersRepository.countAll(dbFilters);

    return {
      users,
      meta: { total, page, limit },
    };
  }

  async getUser(userId) {
    const user = await usersRepository.findById(userId);
    if (!user) throw notFound('User not found');
    const roles = await usersRepository.getUserRoles(userId);
    const { password_hash, refresh_token, ...safeUser } = user;
    return { ...safeUser, roles };
  }

  async inviteUser(data, userContext) {
    // Check email uniqueness
    const existing = await usersRepository.findByEmail(data.email);
    if (existing) throw badRequest('A user with this email already exists');

    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
    const passwordHash = await bcrypt.hash(data.temporaryPassword || 'ChangeMe123!', rounds);

    const user = await usersRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    await auditLogService.log({
      userId: userContext.userId,
      action: 'user.invited',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: userContext.ipAddress,
      newValues: { email: user.email },
    });

    return user;
  }

  async updateUser(targetUserId, data, userContext) {
    const user = await usersRepository.findById(targetUserId);
    if (!user) throw notFound('User not found');

    const oldValues = { first_name: user.first_name, last_name: user.last_name, email: user.email };
    const updated = await usersRepository.update(targetUserId, data);

    await auditLogService.log({
      userId: userContext.userId,
      action: 'user.updated',
      resourceType: 'user',
      resourceId: targetUserId,
      ipAddress: userContext.ipAddress,
      oldValues,
      newValues: data,
    });

    return updated;
  }

  async updateRoles(targetUserId, roleIds, userContext) {
    const user = await usersRepository.findById(targetUserId);
    if (!user) throw notFound('User not found');

    const oldRoles = await usersRepository.getUserRoles(targetUserId);
    const roles = await usersRepository.setUserRoles(targetUserId, roleIds);

    await auditLogService.log({
      userId: userContext.userId,
      action: 'user.roles_updated',
      resourceType: 'user',
      resourceId: targetUserId,
      ipAddress: userContext.ipAddress,
      oldValues: { roles: oldRoles.map(r => r.name) },
      newValues: { roles: roles.map(r => r.name) },
    });

    return roles;
  }

  async deactivateUser(targetUserId, userContext) {
    const user = await usersRepository.findById(targetUserId);
    if (!user) throw notFound('User not found');
    if (!user.is_active) throw badRequest('User is already deactivated');

    await usersRepository.deactivate(targetUserId);

    await auditLogService.log({
      userId: userContext.userId,
      action: 'user.deactivated',
      resourceType: 'user',
      resourceId: targetUserId,
      ipAddress: userContext.ipAddress,
    });
  }
}

module.exports = new UsersService();
