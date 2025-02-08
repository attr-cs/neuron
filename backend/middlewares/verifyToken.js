const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  console.log("1");
  const authHeader = req.headers.authorization;
  console.log("2");
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("3");
    console.log(authHeader)
    return res.status(401).json({ message: 'No token provided' });
    console.log("4");
  }

  const token = authHeader.split(' ')[1];
  console.log("5");
  try {
    console.log("6");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("7");
    console.log("Decoded Token:", decoded);
    console.log("8");
    req.user = {
      id: decoded.userId,
      username: decoded.username
    };
    console.log("9");
    next();
    console.log("10");
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
