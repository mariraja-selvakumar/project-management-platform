const { verifyAccessToken } = require('../utils/jwt');
const { unauthorized } = require('../utils/errors');
const db = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(unauthorized('Authorization header missing or invalid format'));
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return next(unauthorized('Invalid or expired token'));
    }

    // Retrieve user from DB to verify they are active
    const user = await db('users').where({ id: decoded.userId }).first();
    if (!user || !user.is_active) {
      return next(unauthorized('User is deactivated or does not exist'));
    }

    // Populate user details on req.user
    req.user = {
      userId: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
