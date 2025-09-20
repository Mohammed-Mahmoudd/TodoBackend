const jwt = require("jsonwebtoken");

function authMiddleWare(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (token) {
    try {
      const isAuthToken = jwt.verify(token, process.env.JWT_SECRET);
      req.user = isAuthToken;
      console.log(isAuthToken);
      next();
    } catch (error) {
      res.json({
        message: "Not Verified",
        error: error,
      });
    }
  } else {
    res.json({
      message: "Unauthorized",
    });
  }
}

module.exports = authMiddleWare;
