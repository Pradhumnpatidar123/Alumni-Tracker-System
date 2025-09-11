// // middleware/requireAuth.js
// // const jwt = require('jsonwebtoken');
// import jwt from 'jsonwebtoken';
// function requireAuth(req, res, next) {

//   try {
//     const token = req.cookies?.admin_jwt; // HttpOnly cookie set at login
//     if (!token) return res.status(401).json({ authenticated: false, message: 'No session' });
//     const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
//     req.user = decoded; // e.g., { email, role, iat, exp }
//     return next();
//   } catch (e) {
//     return res.status(401).json({ authenticated: false, message: 'Invalid or expired session' });
//   }
// }
// export default requireAuth;
// // module.exports = { requireAuth };
// middleware/requireAuth.js
import jwt from 'jsonwebtoken';

// Verifies an admin token from the 'admin_jwt' HttpOnly cookie
export function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.admin_jwt;
    if (!token) {
      return res.status(401).json({ authenticated: false, message: 'No admin session' });
    }
    const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
    req.user = decoded;
    req.userType = 'admin';
    return next();
  } catch (e) {
    return res.status(401).json({ authenticated: false, message: 'Invalid or expired admin session' });
  }
}

// Verifies an alumni token from the 'alumni_jwt' HttpOnly cookie
export function requireAlumni(req, res, next) {
  try {
    const token = req.cookies?.alumni_jwt;
    console.log("alumni token in middleware",token);
    if (!token) {
      return res.status(401).json({ authenticated: false, message: 'No alumni session' });
    }
    const decoded = jwt.verify(token, process.env.ALUMNI_SECRET);
    req.user = decoded;
    req.userType = 'alumni';
    return next();
  } catch (e) {
    return res.status(401).json({ authenticated: false, message: 'Invalid or expired alumni session' });
  }
}

// Accepts either admin_jwt or alumni_jwt; prefers admin if both present
export default function requireAuthEither(req, res, next) {
  const hasAdmin = Boolean(req.cookies?.admin_jwt);
  const hasAlumni = Boolean(req.cookies?.alumni_jwt);

  if (!hasAdmin && !hasAlumni) {
    return res.status(401).json({ authenticated: false, message: 'No session' });
  }

  try {
    if (hasAdmin) {
      const decoded = jwt.verify(req.cookies.admin_jwt, process.env.ADMIN_SECRET);
      req.user = decoded;
      req.userType = 'admin';
      return next();
    }
  } catch (e) {
    // fall through to try alumni if both exist or admin fails
  }

  try {
    if (hasAlumni) {
      const decoded = jwt.verify(req.cookies.alumni_jwt, process.env.ALUMNI_SECRET);
      req.user = decoded;
      req.userType = 'alumni';
      return next();
    }
  } catch (e) {
    // continue to error response
  }

  return res.status(401).json({ authenticated: false, message: 'Invalid or expired session' });
}
