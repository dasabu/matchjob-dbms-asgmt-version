import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongoModule } from 'src/mongo/mongo.module';

@Module({
  imports: [MongoModule], // Import MongoModule để truy cập MongoService
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Xuất UsersService cho các module khác
})
export class UsersModule {}
