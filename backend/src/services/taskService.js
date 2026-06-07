const taskRepository = require('../repositories/taskRepository');
const projectRepository = require('../repositories/projectRepository');
const permissionRepository = require('../repositories/permissionRepository');
const auditLogService = require('./auditLogService');
const { notFound, forbidden } = require('../utils/errors');

class TaskService {
  async listAllTasks(filters, userContext) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const tasks = await taskRepository.findAll({
      status: filters.status,
      priority: filters.priority,
      assigneeId: filters.assigneeId,
      limit,
      offset,
    });

    const total = await taskRepository.countAll({
      status: filters.status,
      priority: filters.priority,
      assigneeId: filters.assigneeId,
    });

    return {
      tasks,
      meta: { total, page, limit },
    };
  }

  async listTasks(projectId, filters, userContext) {
    // Validate project exists
    const project = await projectRepository.findById(projectId);
    if (!project || project.status === 'archived') {
      throw notFound('Project not found');
    }

    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const tasks = await taskRepository.findAll({
      projectId,
      status: filters.status,
      priority: filters.priority,
      assigneeId: filters.assigneeId,
      limit,
      offset,
    });

    const total = await taskRepository.countAll({
      projectId,
      status: filters.status,
      priority: filters.priority,
      assigneeId: filters.assigneeId,
    });

    return {
      tasks,
      meta: { total, page, limit },
    };
  }

  async getTask(taskId) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw notFound('Task not found');
    return task;
  }

  async createTask(projectId, data, userContext) {
    const project = await projectRepository.findById(projectId);
    if (!project || project.status === 'archived') {
      throw notFound('Project not found');
    }

    const task = await taskRepository.create({
      ...data,
      projectId,
    });

    await auditLogService.log({
      userId: userContext.userId,
      action: 'task.created',
      resourceType: 'task',
      resourceId: task.id,
      ipAddress: userContext.ipAddress,
      newValues: task,
    });

    return task;
  }

  async updateTask(taskId, data, userContext) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw notFound('Task not found');

    // Members can only update tasks assigned to them
    const roles = await permissionRepository.getUserRoles(userContext.userId);
    const isAdminOrManager = roles.includes('admin') || roles.includes('manager');
    const isAssignee = task.assignee_id === userContext.userId;

    if (!isAdminOrManager && !isAssignee) {
      throw forbidden('Forbidden: you are not the assignee of this task');
    }

    const updatedTask = await taskRepository.update(taskId, data);

    await auditLogService.log({
      userId: userContext.userId,
      action: 'task.updated',
      resourceType: 'task',
      resourceId: task.id,
      ipAddress: userContext.ipAddress,
      oldValues: task,
      newValues: updatedTask,
    });

    return updatedTask;
  }

  async patchTaskStatus(taskId, status, userContext) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw notFound('Task not found');

    const roles = await permissionRepository.getUserRoles(userContext.userId);
    const isAdminOrManager = roles.includes('admin') || roles.includes('manager');
    const isAssignee = task.assignee_id === userContext.userId;

    if (!isAdminOrManager && !isAssignee) {
      throw forbidden('Forbidden: you are not the assignee of this task');
    }

    const updatedTask = await taskRepository.update(taskId, { status });

    await auditLogService.log({
      userId: userContext.userId,
      action: 'task.status_changed',
      resourceType: 'task',
      resourceId: task.id,
      ipAddress: userContext.ipAddress,
      oldValues: { status: task.status },
      newValues: { status },
    });

    return updatedTask;
  }

  async deleteTask(taskId, userContext) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw notFound('Task not found');

    await taskRepository.delete(taskId);

    await auditLogService.log({
      userId: userContext.userId,
      action: 'task.deleted',
      resourceType: 'task',
      resourceId: task.id,
      ipAddress: userContext.ipAddress,
      oldValues: task,
    });
  }
}

module.exports = new TaskService();
