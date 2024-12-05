import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MongoService } from '../mongo/mongo.service';
import { Db, ObjectId } from 'mongodb';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
// import aqp from 'api-query-params';

@Injectable()
export class UsersService implements OnModuleInit {
  private db: Db;

  constructor(private readonly mongoService: MongoService) {}

  onModuleInit() {
    this.db = this.mongoService.getDatabase(); // Đảm bảo getDatabase được gọi sau khi onModuleInit
  }

  getHashPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }

  isValidPassword(password: string, hashedPassword: string): boolean {
    return compareSync(password, hashedPassword);
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, ...rest } = createUserDto;

    const isExist = await this.db.collection('users').findOne({ email });
    if (isExist) {
      throw new BadRequestException(
        `Email: ${email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`,
      );
    }

    const hashPassword = this.getHashPassword(password);

    const result = await this.db.collection('users').insertOne({
      ...rest,
      email,
      password: hashPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { _id: result.insertedId, createdAt: new Date() };
  }

  async findAll(currentPage?: number, limit?: number) {
    const page = currentPage > 0 ? currentPage : 1;
    const pageSize = limit > 0 ? limit : 10;

    const allUsers = await this.db.collection('users').find({}).toArray();

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedUsers = allUsers.slice(startIndex, endIndex);
    const totalItems = allUsers.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      meta: {
        current: page,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: paginatedUsers,
    };
  }

  async findOne(id: string) {
    const objectId = new ObjectId(id);
    const user = await this.db.collection('users').findOne({ _id: objectId });
    if (!user) {
      throw new BadRequestException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(updateUserDto: UpdateUserDto) {
    const { _id, ...updateFields } = updateUserDto;

    const result = await this.db.collection('users').updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          ...updateFields,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new BadRequestException(`User with ID ${_id} not found`);
    }

    return { message: 'User updated successfully' };
  }

  async remove(id: string) {
    const objectId = new ObjectId(id);

    const foundUser = await this.db
      .collection('users')
      .findOne({ _id: objectId });

    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    const deleteResult = await this.db.collection('users').deleteOne({
      _id: objectId,
    });

    if (deleteResult.deletedCount === 0) {
      throw new BadRequestException('Failed to delete user');
    }

    return { message: 'User deleted successfully' };
  }

  async findUserByEmail(email: string) {
    return await this.db.collection('users').findOne({ email });
  }

  async updateUserToken(refreshToken: string, id: string) {
    return await this.db
      .collection('users')
      .updateOne({ _id: new ObjectId(id) }, { $set: { refreshToken } });
  }

  async findUserByToken(refreshToken: string) {
    return await this.db.collection('users').findOne({ refreshToken });
  }
}
