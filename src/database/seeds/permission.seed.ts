import { Permission } from '@/modules/permissions/schemas/permission.schema';
import { getModelToken, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export const PERMISSIONS = [
  {
    id: 1,
    name: 'create_user',
    description: 'Ability to create a new user',
  },
  {
    id: 2,
    name: 'update_user',
    description: 'Ability to update an existing user',
  },
  {
    id: 3,
    name: 'delete_user',
    description: 'Ability to delete a user',
  },
  {
    id: 4,
    name: 'view_reports',
    description: 'Ability to view reports',
  },
  {
    id: 5,
    name: 'manage_roles',
    description: 'Ability to manage roles and permissions',
  },
];

export class PermissionSeeder {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async seed() {
    try {
      const existingPermissions = await this.permissionModel.find({});
      if (existingPermissions.length === 0) {
        await this.permissionModel.insertMany(PERMISSIONS);
        console.log('Permissions seeded successfully');
      } else {
        console.log('Permissions already seeded');
      }
    } catch (error) {
      console.error('Error seeding permissions:', error);
    }
  }
}
