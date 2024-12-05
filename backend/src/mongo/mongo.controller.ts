import { Controller, Get } from '@nestjs/common';
import { MongoService } from './mongo.service';
import { Public } from 'src/core/customize.decorator';

@Controller('mongo')
export class MongoController {
  constructor(private readonly mongoService: MongoService) {}

  @Public()
  @Get('test-connection')
  async getStatus() {
    try {
      const db = this.mongoService.getDatabase();
      const collections = await db.listCollections().toArray();
      return { status: 'Connected', collections };
    } catch (error) {
      return { status: 'Error', message: error.message };
    }
  }
}
