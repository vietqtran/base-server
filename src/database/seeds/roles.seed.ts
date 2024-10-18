import { Role } from '@/modules/roles/schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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

export class RoleSeeder {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  async seed() {
    try {
      const existingRoles = await this.roleModel.find({});
      if (existingRoles.length === 0) {
        await this.roleModel.insertMany(ROLES);
        console.log('Roles seeded successfully');
      } else {
        console.log('Roles already seeded');
      }
    } catch (error) {
      console.error('Error seeding roles:', error);
    }
  }
}
