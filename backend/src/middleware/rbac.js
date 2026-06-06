const permissionRepository = require('../repositories/permissionRepository');
const { forbidden } = require('../utils/errors');

const requirePermission = (resource, action) => async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return next(forbidden('Forbidden: insufficient permissions'));
    }

    const { userId } = req.user;
    const permission = `${resource}:${action}`;
    
    const hasPermission = await permissionRepository.userHasPermission(userId, permission);
    if (!hasPermission) {
      return next(forbidden('Forbidden: insufficient permissions'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requirePermission,
};
