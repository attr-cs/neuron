const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');

const adminMiddleware = async (req, res, next) => {

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
    
  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: Admin rights required' });
    }
    req.user = {
      id: decoded.userId,
      username: decoded.username
    };
    
    next();
    
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 

module.exports = { adminMiddleware };