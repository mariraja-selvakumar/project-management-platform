const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Deletes ALL existing entries in reverse dependency order
  await knex('user_roles').del();
  await knex('audit_logs').del();
  await knex('tasks').del();
  await knex('projects').del();
  await knex('users').del();
  await knex('permissions').del();
  await knex('roles').del();

  // 1. Seed roles
  const roles = [
    { id: 1, name: 'admin' },
    { id: 2, name: 'manager' },
    { id: 3, name: 'member' },
    { id: 4, name: 'viewer' }
  ];
  await knex('roles').insert(roles);

  // 2. Seed permissions
  const permissions = [
    { id: 1, name: 'projects:create', resource: 'projects', action: 'create' },
    { id: 2, name: 'projects:read', resource: 'projects', action: 'read' },
    { id: 3, name: 'projects:update', resource: 'projects', action: 'update' },
    { id: 4, name: 'projects:delete', resource: 'projects', action: 'delete' },
    { id: 5, name: 'tasks:create', resource: 'tasks', action: 'create' },
    { id: 6, name: 'tasks:update', resource: 'tasks', action: 'update' },
    { id: 7, name: 'tasks:delete', resource: 'tasks', action: 'delete' },
    { id: 10, name: 'tasks:read', resource: 'tasks', action: 'read' },
    { id: 8, name: 'users:manage', resource: 'users', action: 'manage' },
    { id: 9, name: 'reports:view', resource: 'reports', action: 'view' }
  ];
  await knex('permissions').insert(permissions);

  // 3. Seed default admin user
  const passwordHash = await bcrypt.hash('AdminPassword123!', 12);
  const [adminId] = await knex('users').insert({
    email: 'admin@platform.com',
    password_hash: passwordHash,
    first_name: 'System',
    last_name: 'Administrator',
    is_active: 1,
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  });

  // 4. Assign admin role to user
  await knex('user_roles').insert({
    user_id: adminId,
    role_id: 1 // admin role
  });
};
