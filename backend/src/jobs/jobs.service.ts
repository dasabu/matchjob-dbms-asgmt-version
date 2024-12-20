import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { MongoService } from 'src/mongo/mongo.service';
import { ObjectId, Db } from 'mongodb';
import aqp from 'api-query-params';

@Injectable()
export class JobsService implements OnModuleInit {
  private db: Db;

  constructor(private mongoService: MongoService) {}

  onModuleInit() {
    this.db = this.mongoService.getDatabase();
  }

  async create(createJobDto: CreateJobDto) {
    const job = {
      ...createJobDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.db.collection('jobs').insertOne(job);
    return { _id: result.insertedId, createdAt: job.createdAt };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const totalItems = await this.db.collection('jobs').countDocuments(filter);

    const jobs = await this.db
      .collection('jobs')
      .find(filter)
      .skip(offset)
      .limit(limit)
      .sort(sort as any)
      .toArray();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result: jobs,
    };
  }

  async findOne(id: string) {
    const job = await this.db
      .collection('jobs')
      .findOne({ _id: new ObjectId(id) });
    if (!job) throw new BadRequestException(`Job id=${id} không tồn tại`);
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    const result = await this.db.collection('jobs').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateJobDto,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new BadRequestException(`Không tìm thấy Job với id=${id}`);
    }

    return { message: 'Cập nhật Job thành công' };
  }

  async remove(id: string) {
    const result = await this.db
      .collection('jobs')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new BadRequestException(`Không tìm thấy với id=${id}`);
    }

    return { message: 'Xóa Job thành công' };
  }

  async getJobsByLocationAndSkills(location: string, skills: string[]) {
    const query: { location?: string; skills?: { $in: string[] } } = {};

    if (location) {
      query.location = location; // query = { location: 'HANOI' }
    }
    if (skills.length > 0) {
      query.skills = { $in: skills }; // query = { skills: { $in: ['TYPESCRIPT', 'REACT.JS'] }}
    }
    // Result: query = { location: 'HANOI', skills: { $in: ['TYPESCRIPT', 'REACT.JS'] } }

    const result = await this.db.collection('jobs').find(query).toArray();
    return result;
  }

  async getSkillsStats() {
    const pipeline = [
      { $unwind: '$skills' },
      { $group: { _id: '$skills', total: { $sum: 1 } } },
      { $project: { skill: '$_id', total: 1, _id: 0 } },
      // { $sort: { total: -1 } },
    ];

    const result = await this.db
      .collection('jobs')
      .aggregate(pipeline)
      .toArray();

    return result;
  }

  async getResumesCountByJobId(id: string) {
    const pipeline = [
      {
        $match: { _id: new ObjectId(id) }, // Tìm job cụ thể
      },
      {
        $lookup: {
          from: 'resumes', // Join với collection resumes
          localField: '_id', // Trường _id trong jobs
          foreignField: 'jobId', // Trường jobId trong resumes
          as: 'resumes', // Kết quả join
        },
      },
      {
        $project: {
          _id: 1,
          totalResumes: { $size: '$resumes' }, // Đếm số lượng resume đã nộp
        },
      },
    ];

    const result = await this.db
      .collection('jobs')
      .aggregate(pipeline)
      .toArray();

    return result[0];
  }
}
