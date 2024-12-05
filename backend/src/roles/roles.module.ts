import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { MongoModule } from 'src/mongo/mongo.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [MongoModule],
  exports: [RolesService],
})
export class RolesModule {}
