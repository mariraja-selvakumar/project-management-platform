const db = require('../config/database');

class AuditLogRepository {
  async create(data) {
    const [id] = await db('audit_logs').insert({
      user_id: data.userId || null,
      action: data.action,
      resource_type: data.resourceType,
      resource_id: data.resourceId || null,
      ip_address: data.ipAddress || null,
      old_values: data.oldValues ? JSON.stringify(data.oldValues) : null,
      new_values: data.newValues ? JSON.stringify(data.newValues) : null,
    });
    return id;
  }

  async findAll(filters = {}) {
    let query = db('audit_logs');
    if (filters.userId) query = query.where('user_id', filters.userId);
    if (filters.resourceType) query = query.where('resource_type', filters.resourceType);
    if (filters.resourceId) query = query.where('resource_id', filters.resourceId);
    return query.orderBy('created_at', 'desc');
  }
}

module.exports = new AuditLogRepository();
