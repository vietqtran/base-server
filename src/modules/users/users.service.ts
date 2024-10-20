import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userModel
      .find()
      .select(
        '-password_hash -sessions -social_logins -is_active -is_verified -roles',
      )
      .exec();
    return users;
  }

  async findOne(filterQuery: FilterQuery<User>) {
    try {
      return await this.userModel.findOne(filterQuery).exec();
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) throw new Error('User not found');
      const isValid = await argon2.verify(password, user.password_hash);
      if (!isValid) throw new Error('Invalid password');
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.userModel.create({
        username: createUserDto.username,
        email: createUserDto.email,
        password_hash: createUserDto.password_hash,
        roles: createUserDto.roles,
      });
      user.password_hash = undefined;
      user.roles = [];
      user.sessions = undefined;
      user.social_logins = undefined;
      user.is_active = undefined;
      user.is_verified = undefined;
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
