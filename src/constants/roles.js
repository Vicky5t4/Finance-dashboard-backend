const ROLES = {
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin'
};

const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

const ROLE_PERMISSIONS = {
  [ROLES.VIEWER]: ['records:read', 'summary:read'],
  [ROLES.ANALYST]: ['records:read', 'summary:read'],
  [ROLES.ADMIN]: ['records:read', 'records:write', 'summary:read', 'users:manage']
};

module.exports = {
  ROLES,
  USER_STATUS,
  ROLE_PERMISSIONS
};
