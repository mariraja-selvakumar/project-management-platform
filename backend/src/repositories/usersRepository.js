const db = require('../config/database');

class UsersRepository {
  async findAll({ isActive, limit = 20, offset = 0 } = {}) {
    let query = db('users');
    if (isActive !== undefined) query = query.where('is_active', isActive);
    return query.limit(limit).offset(offset).orderBy('created_at', 'desc')
      .select('id', 'email', 'first_name', 'last_name', 'is_active', 'last_login_at', 'created_at', 'updated_at');
  }

  async countAll({ isActive } = {}) {
    let query = db('users').count('id as count');
    if (isActive !== undefined) query = query.where('is_active', isActive);
    const result = await query.first();
    return parseInt(result.count, 10);
  }

  async findById(id) {
    return db('users').where({ id }).first();
  }

  async findByEmail(email) {
    return db('users').where({ email }).first();
  }

  async create(data) {
    const [id] = await db('users').insert({
      email: data.email,
      password_hash: data.passwordHash,
      first_name: data.firstName,
      last_name: data.lastName,
      is_active: 1,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
    return db('users').where({ id })
      .select('id', 'email', 'first_name', 'last_name', 'is_active', 'created_at', 'updated_at')
      .first();
  }

  async update(id, data) {
    const payload = {};
    if (data.firstName !== undefined) payload.first_name = data.firstName;
    if (data.lastName !== undefined) payload.last_name = data.lastName;
    if (data.email !== undefined) payload.email = data.email;
    payload.updated_at = db.fn.now();

    await db('users').where({ id }).update(payload);
    return db('users').where({ id })
      .select('id', 'email', 'first_name', 'last_name', 'is_active', 'created_at', 'updated_at')
      .first();
  }

  async deactivate(id) {
    await db('users').where({ id }).update({ is_active: 0, updated_at: db.fn.now() });
  }

  async getUserRoles(userId) {
    return db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .select('roles.id', 'roles.name');
  }

  async setUserRoles(userId, roleIds) {
    await db('user_roles').where({ user_id: userId }).del();
    if (roleIds.length > 0) {
      const rows = roleIds.map(roleId => ({ user_id: userId, role_id: roleId }));
      await db('user_roles').insert(rows);
    }
    return this.getUserRoles(userId);
  }
}

module.exports = new UsersRepository();
