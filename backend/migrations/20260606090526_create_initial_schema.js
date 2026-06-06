exports.up = function(knex) {
  return knex.schema
    // 1. roles
    .createTable('roles', (table) => {
      table.increments('id').unsigned().primary();
      table.string('name', 50).notNullable();
    })
    // 2. permissions
    .createTable('permissions', (table) => {
      table.increments('id').unsigned().primary();
      table.string('name', 100).unique().notNullable();
      table.string('resource', 50).notNullable();
      table.string('action', 50).notNullable();
    })
    // 3. users
    .createTable('users', (table) => {
      table.increments('id').unsigned().primary();
      table.string('email', 255).unique().notNullable();
      table.string('password_hash', 255).notNullable();
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamp('last_login_at').nullable();
      table.string('refresh_token', 500).nullable();
      table.timestamps(true, true);
    })
    // 4. user_roles
    .createTable('user_roles', (table) => {
      table.integer('user_id').unsigned().notNullable();
      table.integer('role_id').unsigned().notNullable();
      
      table.foreign('user_id').references('users.id').onDelete('CASCADE');
      table.foreign('role_id').references('roles.id').onDelete('CASCADE');
      table.primary(['user_id', 'role_id']);
    })
    // 5. projects
    .createTable('projects', (table) => {
      table.increments('id').unsigned().primary();
      table.integer('owner_id').unsigned().notNullable();
      table.string('name', 200).notNullable();
      table.text('description').nullable();
      table.enum('status', ['active', 'on_hold', 'completed', 'archived']).defaultTo('active');
      table.date('start_date').nullable();
      table.date('due_date').nullable();
      
      table.foreign('owner_id').references('users.id').onDelete('RESTRICT');
      table.timestamps(true, true);
    })
    // 6. tasks
    .createTable('tasks', (table) => {
      table.increments('id').unsigned().primary();
      table.integer('project_id').unsigned().notNullable();
      table.integer('assignee_id').unsigned().nullable();
      table.string('title', 300).notNullable();
      table.text('description').nullable();
      table.enum('status', ['todo', 'in_progress', 'in_review', 'done', 'cancelled']).defaultTo('todo');
      table.enum('priority', ['low', 'medium', 'high', 'critical']).defaultTo('medium');
      table.date('due_date').nullable();
      
      table.foreign('project_id').references('projects.id').onDelete('CASCADE');
      table.foreign('assignee_id').references('users.id').onDelete('SET NULL');
      table.timestamps(true, true);
    })
    // 7. audit_logs
    .createTable('audit_logs', (table) => {
      table.bigIncrements('id').unsigned().primary();
      table.integer('user_id').unsigned().nullable();
      table.string('action', 100).notNullable();
      table.string('resource_type', 50).notNullable();
      table.integer('resource_id').unsigned().nullable();
      table.string('ip_address', 45).nullable();
      table.json('old_values').nullable();
      table.json('new_values').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('user_id').references('users.id').onDelete('SET NULL');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('audit_logs')
    .dropTableIfExists('tasks')
    .dropTableIfExists('projects')
    .dropTableIfExists('user_roles')
    .dropTableIfExists('users')
    .dropTableIfExists('permissions')
    .dropTableIfExists('roles');
};
