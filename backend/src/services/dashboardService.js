const dashboardRepository = require('../repositories/dashboardRepository');
const auditLogRepository = require('../repositories/auditLogRepository');

class DashboardService {
  async getDashboardData() {
    const [kpis, tasksByStatus, projectsByStatus, recentActivity] = await Promise.all([
      dashboardRepository.getKPIs(),
      dashboardRepository.getTasksByStatus(),
      dashboardRepository.getProjectsByStatus(),
      auditLogRepository.findAll({ limit: 10 })
    ]);

    return {
      kpis,
      charts: {
        tasksByStatus,
        projectsByStatus,
      },
      recentActivity,
    };
  }
}

module.exports = new DashboardService();
