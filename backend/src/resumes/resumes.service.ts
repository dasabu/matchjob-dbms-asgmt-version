import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/user.interface';
import { Db, ObjectId } from 'mongodb';
import { MongoService } from 'src/mongo/mongo.service';
import aqp from 'api-query-params';

@Injectable()
export class ResumesService implements OnModuleInit {
  private db: Db;

  constructor(private mongoService: MongoService) {}

  onModuleInit() {
    this.db = this.mongoService.getDatabase();
  }

  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    const { url, companyId, jobId } = createUserCvDto;
    const { email, _id } = user;

    const newResume = {
      url,
      companyId: new ObjectId(companyId),
      email,
      jobId: new ObjectId(jobId),
      userId: new ObjectId(_id),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.db.collection('resumes').insertOne(newResume);

    return {
      _id: result.insertedId,
      createdAt: newResume.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;

    const totalItems = await this.db
      .collection('resumes')
      .countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await this.db
      .collection('resumes')
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
    const resume = await this.db
      .collection('resumes')
      .findOne({ _id: objectId });

    if (!resume) {
      throw new BadRequestException(`Resume with id=${id} not found`);
    }

    return resume;
  }

  async findByUsers(user: IUser) {
    const result = await this.db
      .collection('users')
      .aggregate([
        {
          $lookup: {
            from: 'resumes',
            localField: '_id',
            foreignField: 'userId',
            as: 'userResumes',
          },
        },
        {
          $match: {
            _id: new ObjectId(user._id),
          },
        },
        {
          $project: {
            userResumes: 1,
          },
        },
      ])
      .toArray();

    const resumes = result.length > 0 ? result[0].userResumes : [];
    return resumes;
  }

  async update(id: string, status: string) {
    if (!['PENDING', 'REJECTED', 'REVIEWING', 'APPROVED'].includes(status)) {
      throw new BadRequestException(
        `Invalid resume status, must be [PENDING, REJECTED, REVIEWING, APPROVED]`,
      );
    }
    const objectId = new ObjectId(id);

    const updateData = {
      status,
      updatedAt: new Date(),
    };

    const result = await this.db
      .collection('resumes')
      .updateOne({ _id: objectId }, { $set: updateData });

    if (result.matchedCount === 0) {
      throw new BadRequestException(`Resume with id=${id} not found`);
    }

    return { message: 'Resume updated successfully' };
  }

  async remove(id: string) {
    const objectId = new ObjectId(id);

    const result = await this.db
      .collection('resumes')
      .deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      throw new BadRequestException(`Resume with id=${id} not found`);
    }

    return { message: 'Resume deleted successfully' };
  }
}
