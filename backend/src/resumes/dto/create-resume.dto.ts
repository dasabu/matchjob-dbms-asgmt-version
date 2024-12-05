import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateResumeDto {
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'userId không được để trống' })
  @IsMongoId({ message: 'userId phải là MongoId' })
  userId: ObjectId;

  @IsNotEmpty({ message: 'url không được để trống' })
  url: string;

  @IsNotEmpty({ message: 'status không được để trống' })
  status: string;

  @IsNotEmpty({ message: 'companyId không được để trống' })
  @IsMongoId({ message: 'companyId phải là MongoId' })
  companyId: ObjectId;

  @IsNotEmpty({ message: 'jobId không được để trống' })
  @IsMongoId({ message: 'jobId phải là MongoId' })
  jobId: ObjectId;
}

export class CreateUserCvDto {
  @IsNotEmpty({ message: 'url không được để trống' })
  url: string;

  @IsNotEmpty({ message: 'companyId không được để trống' })
  @IsMongoId({ message: 'companyId phải là MongoId' })
  companyId: ObjectId;

  @IsNotEmpty({ message: 'jobId không được để trống' })
  @IsMongoId({ message: 'jobId phải là MongoId' })
  jobId: ObjectId;
}
