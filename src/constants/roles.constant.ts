export const ROLES = [
  {
    id: 1,
    name: 'Admin',
    description: 'Administrator role with full access',
    permissions:
      'create_user,update_user,delete_user,view_reports,manage_roles',
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Manager role with limited access',
    permissions: 'view_reports',
  },
  {
    id: 3,
    name: 'User',
    description: 'Regular user role with basic access',
    permissions: 'view_reports,update_user,delete_user',
  },
];
