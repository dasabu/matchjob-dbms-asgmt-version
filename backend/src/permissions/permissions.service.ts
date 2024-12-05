import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { MongoService } from 'src/mongo/mongo.service';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService implements OnModuleInit {
  private db: Db;

  constructor(private readonly mongoService: MongoService) {}

  onModuleInit() {
    this.db = this.mongoService.getDatabase(); // Đảm bảo getDatabase được gọi sau khi onModuleInit
  }

  async create(createPermissionDto: CreatePermissionDto) {
    const { name, apiPath, method, module } = createPermissionDto;

    const isExist = await this.db.collection('permissions').findOne({
      apiPath,
      method,
    });
    if (isExist) {
      throw new BadRequestException(
        `Permission với apiPath=${apiPath} , method=${method} đã tồn tại!`,
      );
    }

    const result = await this.db.collection('permissions').insertOne({
      name,
      apiPath,
      method,
      module,
      createdAt: new Date(),
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

    const totalItems = await this.db
      .collection('permissions')
      .countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await this.db
      .collection('permissions')
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
    const permission = await this.db.collection('permissions').findOne({
      _id: objectId,
    });
    if (!permission) {
      throw new BadRequestException('Permission not found');
    }
    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const objectId = new ObjectId(id);

    const result = await this.db.collection('permissions').updateOne(
      { _id: objectId },
      {
        $set: {
          ...updatePermissionDto,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new BadRequestException('Permission not found');
    }

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  async remove(id: string) {
    const objectId = new ObjectId(id);

    const result = await this.db.collection('permissions').deleteOne({
      _id: objectId,
    });

    if (result.deletedCount === 0) {
      throw new BadRequestException('Permission not found');
    }

    return {
      message: 'Permission deleted successfully',
    };
  }
}
