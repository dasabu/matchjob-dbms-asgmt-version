import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { MongoService } from 'src/mongo/mongo.service';
import { Db, ObjectId, SortDirection } from 'mongodb';
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
    // filter = { current: '1', pageSize: '4', name: '...', address: '...' }
    // sort = { updatedAt: -1}
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

    return { message: 'Cập nhật công ty thành công' };
  }

  async remove(id: string) {
    const objectId = new ObjectId(id);
    const result = await this.db
      .collection('companies')
      .deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      throw new BadRequestException(`Không tìm thấy công ty id=${id}`);
    }

    return { message: 'Xóa công ty thành công' };
  }

  async getJobsByCompanyId(companyId: string) {
    // Ensure companyId is valid
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const pipeline = [
      {
        $match: { _id: new ObjectId(companyId) }, // Match the specific company
      },
      {
        $lookup: {
          from: 'jobs', // Join with the `jobs` collection
          let: { companyId: { $toString: '$_id' } }, // Convert `ObjectId` to string
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$company._id', '$$companyId'] }, // Match company._id in jobs
              },
            },
          ],
          as: 'jobs', // Save the result in `jobs` field
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          description: 1,
          logo: 1,
          jobs: 1, // Include jobs in the result
        },
      },
    ];

    const result = await this.db
      .collection('companies')
      .aggregate(pipeline)
      .toArray();

    // If no company found or jobs array is missing, return an empty array
    if (!result || result.length === 0) {
      return [];
    }

    return result[0].jobs || []; // Return jobs or an empty array
  }

  async getCompanyJobStats(currentPage: number, limit: number, qs: string) {
    const { filter } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;

    const totalItems = await this.db
      .collection('companies')
      .countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'jobs',
          let: { companyId: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$company._id', '$$companyId'],
                },
              },
            },
          ],
          as: 'jobs',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          description: 1,
          logo: 1,
          totalJobs: { $size: '$jobs' }, // Đếm số lượng jobs
          maxSalary: { $max: '$jobs.salary' }, // Tách riêng maxSalary
          maxSalaryJobId: {
            $reduce: {
              input: '$jobs',
              initialValue: null,
              in: {
                $cond: [
                  { $eq: ['$$this.salary', { $max: '$jobs.salary' }] }, // Tìm job với maxSalary
                  '$$this._id',
                  '$$value',
                ],
              },
            },
          },
        },
      },
      { $sort: { maxSalary: -1 } }, // Sắp xếp giảm dần theo maxSalary
      { $skip: offset },
      { $limit: limit },
    ];

    const result = await this.db
      .collection('companies')
      .aggregate(pipeline)
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
}
