const projectService = require('../services/projectService');

class ProjectController {
  async list(req, res, next) {
    try {
      const { status, ownerId, page, limit } = req.query;
      const userContext = { userId: req.user.userId };
      const { projects, meta } = await projectService.listProjects(
        { status, ownerId, page, limit },
        userContext
      );
      res.status(200).json({
        success: true,
        data: projects,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.getProject(id);
      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const userContext = { userId: req.user.userId, ipAddress: req.ip };
      const project = await projectService.createProject(req.body, userContext);
      res.status(201).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const userContext = { userId: req.user.userId, ipAddress: req.ip };
      const project = await projectService.updateProject(id, req.body, userContext);
      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userContext = { userId: req.user.userId, ipAddress: req.ip };
      await projectService.deleteProject(id, userContext);
      res.status(200).json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async stats(req, res, next) {
    try {
      const { id } = req.params;
      const stats = await projectService.getProjectStats(id);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectController();
