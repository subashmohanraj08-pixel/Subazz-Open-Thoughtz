// Restricts a route to specific roles. Must run AFTER `protect`.
// Usage: router.get('/admin/stats', protect, requireRole('admin'), handler)
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
    }
    next();
  };
};

// Ownership check factory.
// `getResource` should fetch the resource by req.params id and return it (or null).
// The resource must have an `author` (or `user`) field referencing the owner.
// Admins always pass. Everyone else must own the resource.
// This is the core enforcement of: "USER A cannot modify USER B's content."
const requireOwnershipOrAdmin = (Model, ownerField = 'author', paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params[paramName]);
      if (!resource) {
        return res.status(404).json({ success: false, message: 'Resource not found.' });
      }

      const isOwner = resource[ownerField]?.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You can only modify your own content.',
        });
      }

      req.resource = resource; // pass along so controller doesn't have to re-fetch
      req.isAdminAction = isAdmin && !isOwner;
      next();
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid resource id.' });
    }
  };
};

module.exports = { requireRole, requireOwnershipOrAdmin };
