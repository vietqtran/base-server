import { ROLES } from '@/constants/roles.constant';
import { Role } from '@/modules/roles/schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class RoleSeeder {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

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
