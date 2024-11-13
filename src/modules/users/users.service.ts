import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dtos/create-user.dto';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userModel
      .find(
        {},
        {
          password_hash: 0,
          sessions: 0,
          social_logins: 0,
          is_verified: 0,
        },
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
      if (!user) {
        throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND, {
          field: 'email',
          message: 'not-found',
        });
      }
      const isValid = await argon2.verify(password, user.password_hash);
      if (!isValid) {
        throw new CustomHttpException(
          'Invalid password',
          HttpStatus.UNAUTHORIZED,
          {
            field: 'password',
            message: 'wrong-credentials',
          },
        );
      }
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
      user.sessions = undefined;
      user.social_logins = undefined;
      user.is_active = undefined;
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findOneAndUpdate(userId: string, filter: FilterQuery<User>) {
    try {
      const user = await this.userModel.findOne({ _id: userId }).exec();
      if (!user) {
        throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND, {
          field: 'user',
          message: 'not-found',
        });
      }
      return await this.userModel
        .findOneAndUpdate({ _id: userId }, filter)
        .exec();
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
