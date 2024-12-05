import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongoModule } from 'src/mongo/mongo.module';

@Module({
  imports: [MongoModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
