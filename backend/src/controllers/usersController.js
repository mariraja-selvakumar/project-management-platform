const usersService = require('../services/usersService');

class UsersController {
  async list(req, res, next) {
    try {
      const { isActive, page, limit } = req.query;
      const userContext = { userId: req.user.userId };
      const { users, meta } = await usersService.listUsers({ isActive, page, limit }, userContext);
      res.status(200).json({ success: true, data: users, meta });
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const { id } = req.params;
      const user = await usersService.getUser(id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async invite(req, res, next) {
    try {
      const userContext = { userId: req.user.userId, ipAddress: req.ip };
      const user = await usersService.inviteUser(req.body, userContext);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const userContext = { userId: req.user.userId, ipAddress: req.ip };
      const user = await usersService.updateUser(id, req.body, userContext);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateRoles(req, res, next) {
    try {
      const { id } = req.params;
      const { roleIds } = req.body;
      const userContext = { userId: req.user.userId, ipAddress: req.ip };
      const roles = await usersService.updateRoles(id, roleIds, userContext);
      res.status(200).json({ success: true, data: roles });
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req, res, next) {
    try {
      const { id } = req.params;
      const userContext = { userId: req.user.userId, ipAddress: req.ip };
      await usersService.deactivateUser(id, userContext);
      res.status(200).json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsersController();
