const jwt = require('jsonwebtoken');

const userAuth = (req, res, next) => {
  try {

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required.'
      });
    }

    const token =
      authHeader.split(' ')[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    if (!decoded || !decoded.email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user token.'
      });
    }

    req.user = decoded;

    next();

  } catch (error) {

    console.error(
      'USER AUTH ERROR:',
      error
    );

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired user token.'
    });

  }
};

module.exports = userAuth;
