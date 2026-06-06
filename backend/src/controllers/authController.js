const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;
      const data = await authService.register(email, password, firstName, lastName);
      res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const data = await authService.login(email, password, ipAddress);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { userId } = req.user;
      const ipAddress = req.ip;
      await authService.logout(userId, ipAddress);
      res.status(200).json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip;
      const data = await authService.refresh(refreshToken, ipAddress);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { userId } = req.user;
      const { oldPassword, newPassword } = req.body;
      const ipAddress = req.ip;
      await authService.changePassword(userId, oldPassword, newPassword, ipAddress);
      res.status(200).json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const { userId } = req.user;
      const data = await authService.getMe(userId);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
