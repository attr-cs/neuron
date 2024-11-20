const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const rawToken = req.headers.authorization;

    if (!rawToken || !rawToken.startsWith('Bearer ')) {
      return res.status(401).json({ msg: "Authentication token is missing or invalid!" });
    }

    const token = rawToken.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token has expired. Please log in again." });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Invalid token provided!" });
    }

    return res.status(500).json({ msg: "Internal server error during token verification." });
  }
};

module.exports = verifyToken;
