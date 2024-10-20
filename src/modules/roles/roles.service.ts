import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly rolesModel: Model<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.rolesModel.find().exec();
  }

  async findById(id: string): Promise<Role> {
    return this.rolesModel.findById(id).exec();
  }
}
