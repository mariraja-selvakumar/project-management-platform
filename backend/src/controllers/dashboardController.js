const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getDashboard(req, res, next) {
    try {
      const dashboardData = await dashboardService.getDashboardData();
      res.status(200).json({
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
