const db = require('../config/database');

class PermissionRepository {
  async getUserRoles(userId) {
    const roles = await db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .select('roles.name');
    return roles.map(r => r.name);
  }

  async userHasPermission(userId, permission) {
    const roles = await this.getUserRoles(userId);
    
    // Admin has override for all permissions
    if (roles.includes('admin')) {
      return true;
    }

    // Static mapping of role permissions matching the matrix in CLAUDE.md
    const rolePermissionsMap = {
      manager: [
        'projects:create',
        'projects:read',
        'projects:update',
        'tasks:create',
        'tasks:update',
        'tasks:delete',
        'reports:view',
        'users:manage'
        ],
      member: [
        'projects:read',
        'projects:update', // Own projects only logic handled at service/controller layer
        'tasks:create',
        'tasks:update' // Assigned tasks only logic handled at service/controller layer
      ],
      viewer: [
        'projects:read'
      ]
    };

    for (const role of roles) {
      const allowedPermissions = rolePermissionsMap[role] || [];
      if (allowedPermissions.includes(permission)) {
        return true;
      }
    }

    return false;
  }
}

module.exports = new PermissionRepository();
