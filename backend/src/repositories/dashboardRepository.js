const db = require('../config/database');

class DashboardRepository {
  async getKPIs() {
    const [
      projectCounts,
      taskCounts
    ] = await Promise.all([
      db('projects')
        .select(
          db.raw('count(*) as total'),
          db.raw("sum(case when status = 'active' then 1 else 0 end) as active")
        )
        .first(),
      db('tasks')
        .select(
          db.raw('count(*) as total'),
          db.raw("sum(case when status = 'done' then 1 else 0 end) as completed")
        )
        .first()
    ]);

    return {
      projects: {
        total: parseInt(projectCounts.total || 0, 10),
        active: parseInt(projectCounts.active || 0, 10),
      },
      tasks: {
        total: parseInt(taskCounts.total || 0, 10),
        completed: parseInt(taskCounts.completed || 0, 10),
      }
    };
  }

  async getTasksByStatus() {
    const results = await db('tasks')
      .select('status')
      .count('* as count')
      .groupBy('status');
    
    return results.reduce((acc, curr) => {
      acc[curr.status] = parseInt(curr.count, 10);
      return acc;
    }, {});
  }

  async getProjectsByStatus() {
    const results = await db('projects')
      .select('status')
      .count('* as count')
      .groupBy('status');

    return results.reduce((acc, curr) => {
      acc[curr.status] = parseInt(curr.count, 10);
      return acc;
    }, {});
  }
}

module.exports = new DashboardRepository();
