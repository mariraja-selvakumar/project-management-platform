const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const userRepository = require('../repositories/userRepository');
const usersRepository = require('../repositories/usersRepository');
const { invalidCredentials, unauthorized, notFound, badRequest } = require('../utils/errors');
const auditLogService = require('./auditLogService');

class AuthService {
  async register(email, password, firstName, lastName) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw badRequest('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await usersRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    return this._sanitize(user);
  }

  async login(email, password, ipAddress) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.is_active) {
      throw invalidCredentials();
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw invalidCredentials();
    }

    const payload = { userId: user.id, email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await userRepository.saveRefreshToken(user.id, refreshToken);
    await userRepository.updateLastLogin(user.id);

    await auditLogService.log({
      userId: user.id,
      action: 'user.login',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      user: this._sanitize(user),
    };
  }

  async logout(userId, ipAddress) {
    await userRepository.clearRefreshToken(userId);
    
    await auditLogService.log({
      userId,
      action: 'user.logout',
      resourceType: 'user',
      resourceId: userId,
      ipAddress,
    });
  }

  async refresh(token, ipAddress) {
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      throw unauthorized('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user || !user.is_active || user.refresh_token !== token) {
      throw unauthorized('Invalid or expired refresh token');
    }

    const payload = { userId: user.id, email: user.email };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await userRepository.saveRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async changePassword(userId, oldPassword, newPassword, ipAddress) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw notFound('User not found');
    }

    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid) {
      throw badRequest('Incorrect current password');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await userRepository.updatePassword(userId, newPasswordHash);

    // Invalidate existing sessions after password change for security
    await userRepository.clearRefreshToken(userId);

    await auditLogService.log({
      userId,
      action: 'user.password_changed',
      resourceType: 'user',
      resourceId: userId,
      ipAddress,
    });
  }

  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user || !user.is_active) {
      throw unauthorized('User is inactive or does not exist');
    }

    const permissions = await userRepository.getPermissions(userId);

    return {
      ...this._sanitize(user),
      permissions,
    };
  }

  _sanitize(user) {
    const { password_hash, refresh_token, ...safe } = user;
    return safe;
  }
}

module.exports = new AuthService();
