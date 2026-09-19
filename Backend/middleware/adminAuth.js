const jwt = require('jsonwebtoken');

const ADMIN_EMAIL =
  'tanubanglore35@gmail.com';

const adminAuth = (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {

      return res.status(401).json({
        success: false,
        message:
          'Admin authentication required.'
      });

    }

    const token =
      authHeader.substring(7).trim();

    if (!token) {

      return res.status(401).json({
        success: false,
        message:
          'Admin token missing.'
      });

    }

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    const email =
      String(
        decoded?.email || ''
      )
        .trim()
        .toLowerCase();

    const role =
      String(
        decoded?.role || ''
      )
        .trim()
        .toLowerCase();

    if (
      role !== 'admin' ||
      email !== ADMIN_EMAIL
    ) {

      return res.status(403).json({
        success: false,
        message:
          'Admin access denied.'
      });

    }

    req.admin = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message:
        'Invalid or expired admin token.'
    });

  }

};

module.exports = adminAuth;
