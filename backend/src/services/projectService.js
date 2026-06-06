const projectRepository = require('../repositories/projectRepository');
const permissionRepository = require('../repositories/permissionRepository');
const auditLogService = require('./auditLogService');
const { notFound, forbidden } = require('../utils/errors');

class ProjectService {
  async listProjects(filters, userContext) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const dbFilters = {
      status: filters.status,
      ownerId: filters.ownerId,
    };

    const projects = await projectRepository.findAll({ ...dbFilters, limit, offset });
    const total = await projectRepository.countAll(dbFilters);

    return {
      projects,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async getProject(projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project || project.status === 'archived') {
      throw notFound('Project not found');
    }

    const taskSummary = await projectRepository.getTaskCounts(projectId);

    return {
      ...project,
      taskSummary,
    };
  }

  async createProject(data, userContext) {
    const project = await projectRepository.create({
      ...data,
      ownerId: userContext.userId,
    });

    await auditLogService.log({
      userId: userContext.userId,
      action: 'project.created',
      resourceType: 'project',
      resourceId: project.id,
      ipAddress: userContext.ipAddress,
      newValues: project,
    });

    return project;
  }

  async updateProject(projectId, data, userContext) {
    const project = await projectRepository.findById(projectId);
    if (!project || project.status === 'archived') {
      throw notFound('Project not found');
    }

    // Role-based permission checks: Managers & Admins can edit any project,
    // Members can only edit projects they own.
    const roles = await permissionRepository.getUserRoles(userContext.userId);
    const isAdminOrManager = roles.includes('admin') || roles.includes('manager');
    const isOwner = project.owner_id === userContext.userId;

    if (!isAdminOrManager && !isOwner) {
      throw forbidden('Forbidden: you do not own this project');
    }

    const updatedProject = await projectRepository.update(projectId, data);

    await auditLogService.log({
      userId: userContext.userId,
      action: 'project.updated',
      resourceType: 'project',
      resourceId: project.id,
      ipAddress: userContext.ipAddress,
      oldValues: project,
      newValues: updatedProject,
    });

    return updatedProject;
  }

  async deleteProject(projectId, userContext) {
    const project = await projectRepository.findById(projectId);
    if (!project || project.status === 'archived') {
      throw notFound('Project not found');
    }

    // Soft delete projects by changing status to 'archived'
    const updatedProject = await projectRepository.update(projectId, { status: 'archived' });

    await auditLogService.log({
      userId: userContext.userId,
      action: 'project.deleted',
      resourceType: 'project',
      resourceId: project.id,
      ipAddress: userContext.ipAddress,
      oldValues: project,
      newValues: updatedProject,
    });

    return updatedProject;
  }

  async getProjectStats(projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project || project.status === 'archived') {
      throw notFound('Project not found');
    }

    const counts = await projectRepository.getTaskCounts(projectId);
    const totalTasks = Object.values(counts).reduce((a, b) => a + b, 0);
    const completedTasks = counts.done || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      projectId: project.id,
      projectName: project.name,
      totalTasks,
      completedTasks,
      completionRate,
      statusCounts: counts,
    };
  }
}

module.exports = new ProjectService();
