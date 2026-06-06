const db = require('../config/database');

class ProjectRepository {
  async findAll({ status, ownerId, limit = 20, offset = 0 } = {}) {
    let query = db('projects');
    
    // Default to excluding archived unless explicitly filtered
    if (status) {
      query = query.where('status', status);
    } else {
      query = query.whereNot('status', 'archived');
    }

    if (ownerId) {
      query = query.where('owner_id', ownerId);
    }

    return query
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
  }

  async countAll({ status, ownerId } = {}) {
    let query = db('projects').count('id as count');

    if (status) {
      query = query.where('status', status);
    } else {
      query = query.whereNot('status', 'archived');
    }

    if (ownerId) {
      query = query.where('owner_id', ownerId);
    }

    const result = await query.first();
    return parseInt(result.count, 10);
  }

  async findById(id) {
    return db('projects').where({ id }).first();
  }

  async create(data) {
    const [id] = await db('projects').insert({
      owner_id: data.ownerId,
      name: data.name,
      description: data.description || null,
      status: data.status || 'active',
      start_date: data.startDate || null,
      due_date: data.dueDate || null,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
    return this.findById(id);
  }

  async update(id, data) {
    const updatePayload = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.startDate !== undefined) updatePayload.start_date = data.startDate;
    if (data.dueDate !== undefined) updatePayload.due_date = data.dueDate;
    
    updatePayload.updated_at = db.fn.now();

    await db('projects').where({ id }).update(updatePayload);
    return this.findById(id);
  }

  async getTaskCounts(projectId) {
    const counts = await db('tasks')
      .where({ project_id: projectId })
      .select('status')
      .count('id as count')
      .groupBy('status');
    
    return counts.reduce((acc, curr) => {
      acc[curr.status] = parseInt(curr.count, 10);
      return acc;
    }, { todo: 0, in_progress: 0, in_review: 0, done: 0, cancelled: 0 });
  }
}

module.exports = new ProjectRepository();
