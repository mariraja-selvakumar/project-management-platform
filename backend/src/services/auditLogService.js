const auditLogRepository = require('../repositories/auditLogRepository');
const logger = require('../utils/logger');

class AuditLogService {
  async log({ userId, action, resourceType, resourceId, ipAddress, oldValues, newValues }) {
    try {
      return await auditLogRepository.create({
        userId,
        action,
        resourceType,
        resourceId,
        ipAddress,
        oldValues,
        newValues,
      });
    } catch (error) {
      // Prevent logging failures from breaking primary app flows, but capture the issue
      logger.error('Audit logging failed: ' + error.message, { stack: error.stack });
    }
  }
}

module.exports = new AuditLogService();
