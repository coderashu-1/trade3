const jwt = require("jsonwebtoken");

// Authorize user from header or query
function authorize(req, res, next) {
  const token = req.header("auth-token") || req.query.token; // ✅ check query
  if (!token) return res.status(401).json({ msg: "No token. Authorization denied." });

  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Token is not valid." });
  }
}

// Authorize only admin users
function authorizeAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ msg: "Authorization denied" });

  if (!req.user.isAdmin) return res.status(403).json({ msg: "Admin access only" });

  next();
}

// New helper: check admin for serving files (works with query token)
function authorizeAdminFile(req, res, next) {
  const token = req.header("auth-token") || req.query.token; // ✅ check query
  if (!token) return res.status(401).json({ msg: "No token. Authorization denied." });

  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);
    if (!decoded.isAdmin) return res.status(403).json({ msg: "Admin access only" });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Token is not valid." });
  }
}

module.exports = { authorize, authorizeAdmin, authorizeAdminFile };
