export enum ROLES_IDS {
  ADMIN = '1',
  MANAGER = '2',
  USER = '3',
}

export enum ROLE_NAMES {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export const ROLES = [
  {
    id: ROLES_IDS.ADMIN,
    name: ROLE_NAMES.ADMIN,
    description: 'Administrator role with full access',
    permissions:
      'create_user,update_user,delete_user,view_reports,manage_roles',
  },
  {
    id: ROLES_IDS.MANAGER,
    name: ROLE_NAMES.MANAGER,
    description: 'Manager role with limited access',
    permissions: 'view_reports',
  },
  {
    id: ROLES_IDS.USER,
    name: ROLE_NAMES.USER,
    description: 'Regular user role with basic access',
    permissions: 'view_reports,update_user,delete_user',
  },
];

export const RoleMapping: { [key: string]: string } = {
  '1': ROLE_NAMES.ADMIN,
  '2': ROLE_NAMES.MANAGER,
  '3': ROLE_NAMES.USER,
};
