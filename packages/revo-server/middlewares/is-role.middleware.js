const { Role } = require("../constants");

/**
 * Middleware to check if the user's role is among the accepted roles.
 *
 * @param {Array<string>} acceptRoles - Array of roles that are allowed to access the route.
 * @return {Function} - Express middleware function that checks the user's role.
 * 
 * If the user's role is in the list of accepted roles, the request is passed to the next middleware function.
 * Otherwise, a 403 Forbidden response is sent back to the client.
 */

const checkRole = (acceptRoles) => {
  return (req, res, next) => {
      if (req.user && [...acceptRoles, Role.SUPER_ADMIN].includes(req.user.role)) {
          next(); 
      } else {
          res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      }
  };
};


module.exports = checkRole;
