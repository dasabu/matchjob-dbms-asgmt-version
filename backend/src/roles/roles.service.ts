import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { MongoService } from 'src/mongo/mongo.service';
import aqp from 'api-query-params';

@Injectable()
export class RolesService implements OnModuleInit {
  private db: Db;

  constructor(private readonly mongoService: MongoService) {}

  onModuleInit() {
    this.db = this.mongoService.getDatabase(); // Đảm bảo getDatabase được gọi sau khi onModuleInit
  }

  async create(createRoleDto: CreateRoleDto) {
    const { name, description, isActive, permissions } = createRoleDto;

    // Kiểm tra role đã tồn tại
    const isExist = await this.db.collection('roles').findOne({ name });
    if (isExist) {
      throw new BadRequestException(`Role với name="${name}" đã tồn tại!`);
    }

    // Tạo role mới
    const result = await this.db.collection('roles').insertOne({
      name,
      description,
      isActive,
      permissions: permissions.map((id) => new ObjectId(id)),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      _id: result.insertedId,
      createdAt: new Date(),
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;

    const totalItems = await this.db.collection('roles').countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await this.db
      .collection('roles')
      .find(filter)
      .skip(offset)
      .limit(limit)
      .sort(sort as any)
      .toArray();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    const objectId = new ObjectId(id);
    console.log('id: ', id);

    // Lấy role và populate permissions
    const role = await this.db
      .collection('roles')
      .aggregate([
        { $match: { _id: objectId } },
        {
          $lookup: {
            from: 'permissions',
            localField: 'permissions',
            foreignField: '_id',
            as: 'permissions',
          },
        },
      ])
      .toArray();

    if (!role || role.length === 0) {
      throw new BadRequestException('Role not found');
    }

    return role[0];
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const objectId = new ObjectId(id);
    const { name, description, isActive, permissions } = updateRoleDto;

    const result = await this.db.collection('roles').updateOne(
      { _id: objectId },
      {
        $set: {
          name,
          description,
          isActive,
          permissions: permissions?.map((id) => new ObjectId(id)),
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new BadRequestException('Role not found');
    }

    return result;
  }

  async remove(id: string) {
    const objectId = new ObjectId(id);

    // Kiểm tra xem role có tồn tại không
    const role = await this.db.collection('roles').findOne({ _id: objectId });
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    // Xóa role khỏi collection
    const result = await this.db
      .collection('roles')
      .deleteOne({ _id: objectId });

    // Kiểm tra xem có xóa thành công không
    if (result.deletedCount === 0) {
      throw new BadRequestException('Failed to delete the role');
    }

    return {
      message: 'Role deleted successfully',
    };
  }
}
