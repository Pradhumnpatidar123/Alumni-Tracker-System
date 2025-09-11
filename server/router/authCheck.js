import express from 'express';
import jwt from 'jsonwebtoken';

// update to import your correct middlewares
import requireAuth, { requireAdmin, requireAlumni } from '../middleware/requireAuth.js';

const authRouter = express.Router();

// Role-aware auth check endpoints (optional: keep them for direct role checks)
authRouter.get('/api/me/admin', requireAdmin, (req, res) => {
  const { email, role, roles } = req.user || {};
  return res.status(200).json({ authenticated: true, user: { email, role, roles }, roles });
});
authRouter.get('/api/me/alumni', requireAlumni, (req, res) => {
  const { email, role, roles } = req.user || {};
  return res.status(200).json({ authenticated: true, user: { email, role, roles }, roles });
});

// --- Multi-role unified auth check ---
authRouter.get('/api/me', (req, res) => {
  const adminToken = req.cookies?.admin_jwt;
  const alumniToken = req.cookies?.alumni_jwt;

  if (!adminToken && !alumniToken) {
    return res.status(401).json({ authenticated: false, message: 'No session found' });
  }

  try {
    let user = { email: null, roles: [] };

    // Try both tokens (could customize for your use case)
    const rolesFound = [];
    let email = null;

    // Check admin token
    if (adminToken) {
      try {
        const decoded = jwt.verify(adminToken, process.env.ADMIN_SECRET);
        email = decoded.email || email;
        if (Array.isArray(decoded.roles)) {
          decoded.roles.forEach(role => !rolesFound.includes(role) && rolesFound.push(role));
        } else if (decoded.role) {
          !rolesFound.includes(decoded.role) && rolesFound.push(decoded.role);
        }
      } catch (adminError) {
        // Admin token failed, continue to alumni check
      }
    }
    // Check alumni token
    if (alumniToken) {
      try {
        const decoded = jwt.verify(alumniToken, process.env.ALUMNI_SECRET);
        email = decoded.email || email;
        if (Array.isArray(decoded.roles)) {
          decoded.roles.forEach(role => !rolesFound.includes(role) && rolesFound.push(role));
        } else if (decoded.role) {
          !rolesFound.includes(decoded.role) && rolesFound.push(decoded.role);
        }
      } catch (alumniError) {
        // Alumni token failed
      }
    }

    if (rolesFound.length === 0) {
      return res.status(401).json({
        authenticated: false,
        message: 'Invalid or expired session'
      });
    }

    user.email = email;
    user.roles = rolesFound;

    // For compatibility: If you want to keep userType (the highest role for UI routing)
    let userType = null;
    if (rolesFound.includes('admin')) userType = 'admin';
    else if (rolesFound.includes('alumni')) userType = 'alumni';

    return res.status(200).json({
      authenticated: true,
      user,
      roles: rolesFound,
      userType
    });

  } catch (error) {
    return res.status(401).json({ authenticated: false, message: 'Authentication check failed' });
  }
});

export default authRouter;
