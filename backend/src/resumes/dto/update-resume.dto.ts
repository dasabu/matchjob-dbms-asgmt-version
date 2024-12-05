import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import { IsArray, IsEmail, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongodb';

// class UpdatedBy {
//   @IsNotEmpty()
//   _id: ObjectId;

//   @IsNotEmpty()
//   @IsEmail()
//   email: string;
// }

// class History {
//   @IsNotEmpty()
//   status: string;

//   @IsNotEmpty()
//   updatedAt: Date;

//   @ValidateNested()
//   @IsNotEmpty()
//   @Type(() => UpdatedBy)
//   updatedBy: UpdatedBy;
// }

export class UpdateResumeDto extends PartialType(CreateResumeDto) {
  //   @IsNotEmpty({ message: 'history không được để trống' })
  //   @IsArray({ message: 'history có định dạng là array' })
  //   @ValidateNested({ each: true })
  //   @Type(() => History)
  //   history: History[];
}
