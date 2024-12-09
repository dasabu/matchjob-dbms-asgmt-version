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
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessage } from 'src/core/customize.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ResponseMessage('Job created successfully')
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  @Public()
  @ResponseMessage('Fetched job with pagination')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.jobsService.findAll(+currentPage, +limit, qs);
  }

  @Get('/search')
  @Public()
  @ResponseMessage('Fetched jobs by location and skills successfully')
  getJobByLocationAndSkills(
    @Query('location') location: string,
    @Query('skills') skills: string,
  ) {
    const skillsArray = skills ? skills.split(',') : [];
    return this.jobsService.getJobsByLocationAndSkills(location, skillsArray);
  }

  @Get('/skills-stats')
  @Public()
  @ResponseMessage('Fetched skills statistics successfully')
  async getSkillsStats() {
    return this.jobsService.getSkillsStats();
  }

  @Get(':id/resumes-count')
  @Public()
  @ResponseMessage('Fetched skills statistics successfully')
  async getResumesCountByJobId(@Param('id') id: string) {
    return this.jobsService.getResumesCountByJobId(id);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Successfully fetched job by id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Job updated successfully')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  @ResponseMessage('Job deleted successfully')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
