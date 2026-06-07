const taskService = require('../services/taskService');

class TaskController {
  async listAll(req, res, next) {
    try {
      const { status, priority, assigneeId, page, limit } = req.query;
      const userContext = { userId: req.user.userId };
      const { tasks, meta } = await taskService.listAllTasks({ status, priority, assigneeId, page, limit }, userContext);
      res.status(200).json({ success: true, data: tasks, meta });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const { id: projectId } = req.params;
      const { status, priority, assigneeId, page, limit } = req.query;
      const userContext = { userId: req.user.userId };
      const { tasks, meta } = await taskService.listTasks(projectId, { status, priority, assigneeId, page, limit }, userContext);
      res.status(200).json({ success: true, data: tasks, meta });
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.getTask(id);
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { id: projectId } = req.params;
      const userContext = { userId: req.user.userId, ipAddress: req.ip };
      const task = await taskService.createTask(projectId, req.body, userContext);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const userContext = { userId: req.user.userId, ipAddress: req.ip };
      const task = await taskService.updateTask(id, req.body, userContext);
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async patchStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userContext = { userId: req.user.userId, ipAddress: req.ip };
      const task = await taskService.patchTaskStatus(id, status, userContext);
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userContext = { userId: req.user.userId, ipAddress: req.ip };
      await taskService.deleteTask(id, userContext);
      res.status(200).json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
