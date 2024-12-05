import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { MongoService } from 'src/mongo/mongo.service';
import { Db, ObjectId } from 'mongodb';
import { Company } from './company.schema';
import aqp from 'api-query-params';

@Injectable()
export class CompaniesService implements OnModuleInit {
  private db: Db;

  constructor(private mongoService: MongoService) {}

  onModuleInit() {
    this.db = this.mongoService.getDatabase();
  }

  async create(createCompanyDto: CreateCompanyDto) {
    const company: Company = {
      ...createCompanyDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.db.collection('companies').insertOne(company);
    return {
      _id: result.insertedId,
      createdAt: company.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;

    const totalItems = await this.db
      .collection('companies')
      .countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await this.db
      .collection('companies')
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
    const company = await this.db
      .collection('companies')
      .findOne({ _id: objectId });

    if (!company) {
      throw new BadRequestException(`Không tìm thấy công ty id=${id}`);
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const objectId = new ObjectId(id);
    const result = await this.db.collection('companies').updateOne(
      { _id: objectId },
      {
        $set: {
          ...updateCompanyDto,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new BadRequestException(`Không tìm thấy công ty id=${id}`);
    }
    console.log(
      await this.db.collection('companies').findOne({ _id: objectId }),
    );
    return { message: 'Cập nhật công ty thành công' };
  }

  async remove(id: string) {
    const objectId = new ObjectId(id);
    const result = await this.db
      .collection('companies')
      .deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      throw new BadRequestException(`Không tìm thấy công ty với ${id}`);
    }

    return { message: 'Xóa công ty thành công' };
  }
}
