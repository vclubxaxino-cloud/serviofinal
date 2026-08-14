import jwt from "jsonwebtoken";

// Verifies the JWT (sent as an httpOnly cookie) and attaches
// { id, role } to req.actor for downstream routes/controllers to use.
export const protect = (req, res, next) => {
  const token = req.cookies?.servio_token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.actor = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
};

// Restricts a route to one or more roles, e.g. requireRole("admin")
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.actor || !roles.includes(req.actor.role)) {
    return res.status(403).json({ message: "You don't have permission to do this." });
  }
  next();
};
