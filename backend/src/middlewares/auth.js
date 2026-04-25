const jwt = require('jsonwebtoken');

// 认证中间件
const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: '请先登录' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token已过期，请重新登录' });
    }
    return res.status(401).json({ message: '无效的Token' });
  }
};

// 权限检查中间件
const checkPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '请先登录' });
    }

    // 超级管理员拥有所有权限
    if (req.user.role === 'admin') {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(p => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({ message: '没有操作权限' });
    }

    next();
  };
};

// 角色检查中间件
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '请先登录' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '没有操作权限' });
    }

    next();
  };
};

module.exports = {
  auth,
  checkPermission,
  checkRole
};
