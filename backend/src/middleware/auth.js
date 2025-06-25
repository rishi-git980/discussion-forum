import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token validation:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPrefix: token ? token.substring(0, 10) + '...' : 'none',
        authorizationHeader: req.headers.authorization.substring(0, 20) + '...',
        method: req.method,
        path: req.path
      });
    } else {
      console.log('No authorization header or invalid format:', {
        hasAuthHeader: !!req.headers.authorization,
        authHeader: req.headers.authorization,
        method: req.method,
        path: req.path
      });
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no token' 
      });
    }

    if (!token) {
      console.log('No token found in authorization header');
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no token' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', {
        userId: decoded.id,
        iat: decoded.iat,
        exp: decoded.exp,
        currentTime: Math.floor(Date.now() / 1000),
        timeUntilExpiry: decoded.exp - Math.floor(Date.now() / 1000),
        method: req.method,
        path: req.path
      });

      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('User not found for token:', decoded.id);
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, user not found' 
        });
      }

      // Check if user is banned
      if (user.isBanned) {
        let banMessage = 'Your account has been banned.';
        if (user.banReason) {
          banMessage += ` Reason: ${user.banReason}`;
        }
        if (user.banExpiresAt) {
          banMessage += ` Ban expires: ${new Date(user.banExpiresAt).toLocaleDateString()}`;
        }
        console.log('Banned user attempted access:', {
          id: user._id,
          username: user.username,
          method: req.method,
          path: req.path
        });
        return res.status(403).json({ 
          success: false,
          message: banMessage 
        });
      }

      req.user = user;
      console.log('User authenticated:', {
        id: user._id,
        username: user.username,
        role: user.role,
        method: req.method,
        path: req.path
      });
      
      next();
    } catch (error) {
      console.error('Token verification error:', {
        name: error.name,
        message: error.message,
        expiredAt: error.expiredAt,
        stack: error.stack,
        method: req.method,
        path: req.path
      });
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, token expired' 
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, invalid token' 
        });
      }
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, token failed' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// Admin middleware
export const admin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no user found'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export { protect }; 