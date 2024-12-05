import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage } from 'src/core/customize.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('User created successfully')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @ResponseMessage('Users fetched with pagination')
  async findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Successfully fetched user by id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @ResponseMessage('User updated successfully')
  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  @ResponseMessage('User deleted successfully')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
