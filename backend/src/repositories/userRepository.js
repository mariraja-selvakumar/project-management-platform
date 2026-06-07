const db = require('../config/database');

class UserRepository {
  async findByEmail(email) {
    return db('users').where({ email }).first();
  }

  async findById(id) {
    return db('users').where({ id }).first();
  }

  async saveRefreshToken(userId, refreshToken) {
    return db('users')
      .where({ id: userId })
      .update({ refresh_token: refreshToken, updated_at: db.fn.now() });
  }

  async updateLastLogin(userId) {
    return db('users')
      .where({ id: userId })
      .update({ last_login_at: db.fn.now() });
  }

  async updatePassword(userId, passwordHash) {
    return db('users')
      .where({ id: userId })
      .update({ password_hash: passwordHash, updated_at: db.fn.now() });
  }

  async clearRefreshToken(userId) {
    return db('users')
      .where({ id: userId })
      .update({ refresh_token: null, updated_at: db.fn.now() });
  }

  // Returns permissions list for a user
  async getPermissions(userId) {
    const roles = await db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .select('roles.name');
    
    const roleNames = roles.map(r => r.name);
    if (roleNames.includes('admin')) {
      // Admin gets all seeded permissions
      const allPerms = await db('permissions').select('name');
      return allPerms.map(p => p.name);
    }

    const rolePermissionsMap = {
      manager: [
        'projects:create',
        'projects:read',
        'projects:update',
        'tasks:create',
        'tasks:update',
        'tasks:delete',
        'tasks:read',
        'reports:view'
        ],
        member: [
        'projects:read',
        'projects:update',
        'tasks:create',
        'tasks:update',
        'tasks:read'
      ],
      viewer: [
        'projects:read',
        'tasks:read'
      ]
    };

    const userPerms = new Set();
    for (const role of roleNames) {
      const perms = rolePermissionsMap[role] || [];
      perms.forEach(p => userPerms.add(p));
    }
    return Array.from(userPerms);
  }
}

module.exports = new UserRepository();
