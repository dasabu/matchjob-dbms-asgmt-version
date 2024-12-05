import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'description không được để trống' })
  description: string;

  @IsNotEmpty({ message: 'isActive không được để trống' })
  @IsBoolean({ message: 'isActive có giá trị boolean' })
  isActive: boolean;

  @IsNotEmpty({ message: 'permissions không được để trống' })
  @IsMongoId({ each: true, message: 'Mỗi permission phải là ObjectId hợp lệ' })
  @IsArray({ message: 'permissions phải là một array' })
  permissions: ObjectId[];
}
