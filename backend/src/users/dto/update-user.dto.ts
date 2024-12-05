import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNotEmpty({ message: '_id không được để trống' })
  _id: string; // `_id` là string để nhận từ request, sẽ được chuyển sang ObjectId khi thao tác với MongoDB
}
