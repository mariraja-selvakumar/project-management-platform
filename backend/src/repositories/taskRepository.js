const db = require('../config/database');

class TaskRepository {
  async findAll({ projectId, status, priority, assigneeId, limit = 20, offset = 0 } = {}) {
    let query = db('tasks').where({ project_id: projectId });

    if (status) query = query.where('status', status);
    if (priority) query = query.where('priority', priority);
    if (assigneeId) query = query.where('assignee_id', assigneeId);

    return query.limit(limit).offset(offset).orderBy('created_at', 'desc');
  }

  async countAll({ projectId, status, priority, assigneeId } = {}) {
    let query = db('tasks').where({ project_id: projectId }).count('id as count');

    if (status) query = query.where('status', status);
    if (priority) query = query.where('priority', priority);
    if (assigneeId) query = query.where('assignee_id', assigneeId);

    const result = await query.first();
    return parseInt(result.count, 10);
  }

  async findById(id) {
    return db('tasks').where({ id }).first();
  }

  async create(data) {
    const [id] = await db('tasks').insert({
      project_id: data.projectId,
      assignee_id: data.assigneeId || null,
      title: data.title,
      description: data.description || null,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      due_date: data.dueDate || null,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
    return this.findById(id);
  }

  async update(id, data) {
    const updatePayload = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.assigneeId !== undefined) updatePayload.assignee_id = data.assigneeId;
    if (data.dueDate !== undefined) updatePayload.due_date = data.dueDate;

    updatePayload.updated_at = db.fn.now();

    await db('tasks').where({ id }).update(updatePayload);
    return this.findById(id);
  }

  async delete(id) {
    return db('tasks').where({ id }).del();
  }
}

module.exports = new TaskRepository();
